import { Prisma, ChallanStatus, StockMovementType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { CreateChallanInput } from '../validators/challanValidator';
import { generateNextChallanNumber } from '../utils/challanNumber';

export interface ChallanQueryParams {
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

export class ChallanService {
  public async createChallan(data: CreateChallanInput, userId: string) {
    const { customerId, items } = data;

    // 1. Validate Customer existence
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found`);
    }

    if (!items || items.length === 0) {
      throw new BadRequestError('Challan must contain at least one item');
    }

    // 2. Validate Products and prepare snapshots
    let totalQuantity = 0;
    const itemSnapshots = [];

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new BadRequestError(`Invalid quantity '${item.quantity}'. Quantity must be > 0.`);
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundError(`Product with ID '${item.productId}' not found`);
      }

      const unitPriceNum = Number(product.unitPrice);
      const totalPrice = unitPriceNum * item.quantity;
      totalQuantity += item.quantity;

      itemSnapshots.push({
        productId: product.id,
        productNameSnapshot: product.productName,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        totalPrice,
      });
    }

    // 3. Generate Automatic Unique Challan Number
    const challanNumber = await generateNextChallanNumber();

    // 4. Create Challan & ChallanItems (DRAFT state - Stock remains untouched)
    const newChallan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        createdBy: userId,
        items: {
          create: itemSnapshots,
        },
      },
      include: {
        customer: {
          select: { id: true, customerName: true, mobileNumber: true, email: true, businessName: true, gstNumber: true },
        },
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, productName: true, sku: true, currentStock: true },
            },
          },
        },
      },
    });

    return newChallan;
  }

  public async getChallans(query: ChallanQueryParams) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ChallanWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { challanNumber: { contains: searchTerm, mode: 'insensitive' } },
        { customer: { customerName: { contains: searchTerm, mode: 'insensitive' } } },
        { customer: { businessName: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    const [totalCount, challans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, customerName: true, mobileNumber: true, businessName: true },
          },
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      challans,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, productName: true, sku: true, currentStock: true, warehouse: true },
            },
          },
        },
      },
    });

    if (!challan) {
      throw new NotFoundError(`Delivery Challan with ID '${id}' not found`);
    }

    return challan;
  }

  /**
   * CONFIRM CHALLAN WITH ATOMIC DATABASE TRANSACTION
   * 
   * 1. Runs inside a single Prisma database transaction ($transaction)
   * 2. Verifies status is DRAFT (rejects duplicate or cancelled confirmations)
   * 3. Validates live current stock for EVERY product in the challan
   * 4. If ANY item has insufficient stock, rolls back ALL changes immediately
   * 5. Atomically reduces product currentStock & creates OUT stock movements
   * 6. Sets status to CONFIRMED
   */
  public async confirmChallan(id: string, userId: string) {
    return prisma.$transaction(
      async (tx) => {
        // 1. Fetch Challan & line items inside transaction
        const challan = await tx.challan.findUnique({
          where: { id },
          include: {
            items: true,
            customer: true,
          },
        });

        if (!challan) {
          throw new NotFoundError(`Delivery Challan with ID '${id}' not found`);
        }

        // 2. Duplicate / Status Check
        if (challan.status === ChallanStatus.CONFIRMED) {
          throw new BadRequestError(`Challan '${challan.challanNumber}' is already CONFIRMED. Operation rejected.`);
        }

        if (challan.status === ChallanStatus.CANCELLED) {
          throw new BadRequestError(`Cannot confirm a CANCELLED challan '${challan.challanNumber}'.`);
        }

        if (challan.status !== ChallanStatus.DRAFT) {
          throw new BadRequestError(`Only DRAFT challans can be confirmed. Current status: '${challan.status}'.`);
        }

        // 3. Pre-validate stock for EVERY item before making any modifications
        for (const item of challan.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundError(`Product '${item.productNameSnapshot}' (ID: ${item.productId}) not found.`);
          }

          if (product.currentStock < item.quantity) {
            throw new BadRequestError(
              `Insufficient stock for ${item.productNameSnapshot}. Available: ${product.currentStock}, Requested: ${item.quantity}.`
            );
          }
        }

        // 4. All products passed stock validation -> Execute stock deductions & OUT stock movements
        for (const item of challan.items) {
          // Reduce product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { decrement: item.quantity },
            },
          });

          // Create OUT stock movement record
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: StockMovementType.OUT,
              reason: `Sales Challan ${challan.challanNumber}`,
              createdBy: userId,
            },
          });
        }

        // 5. Update Challan status to CONFIRMED
        const confirmedChallan = await tx.challan.update({
          where: { id },
          data: { status: ChallanStatus.CONFIRMED },
          include: {
            customer: true,
            items: {
              include: {
                product: {
                  select: { id: true, productName: true, sku: true, currentStock: true },
                },
              },
            },
          },
        });

        return confirmedChallan;
      },
      { maxWait: 10000, timeout: 20000 }
    );
  }

  /**
   * SAFE CHALLAN CANCELLATION WITH ATOMIC DATABASE TRANSACTION
   * 
   * 1. If DRAFT: Marks as CANCELLED (no stock was deducted, stock remains untouched).
   * 2. If CONFIRMED: Restocks products (+quantity) and logs IN stock movements atomically.
   * 3. If CANCELLED: Rejects operation.
   */
  public async cancelChallan(id: string, userId: string) {
    return prisma.$transaction(
      async (tx) => {
        const challan = await tx.challan.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!challan) {
          throw new NotFoundError(`Delivery Challan with ID '${id}' not found`);
        }

        if (challan.status === ChallanStatus.CANCELLED) {
          throw new BadRequestError(`Challan '${challan.challanNumber}' is already CANCELLED.`);
        }

        // If CONFIRMED, restock inventory & log IN movements
        if (challan.status === ChallanStatus.CONFIRMED) {
          for (const item of challan.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: { increment: item.quantity },
              },
            });

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                quantity: item.quantity,
                type: StockMovementType.IN,
                reason: `Challan Cancellation Restock ${challan.challanNumber}`,
                createdBy: userId,
              },
            });
          }
        }

        // Mark challan as CANCELLED
        const cancelledChallan = await tx.challan.update({
          where: { id },
          data: { status: ChallanStatus.CANCELLED },
          include: { customer: true, items: true },
        });

        return cancelledChallan;
      },
      { maxWait: 10000, timeout: 20000 }
    );
  }
}

export const challanService = new ChallanService();
