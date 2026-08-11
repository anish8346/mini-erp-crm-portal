import { Prisma, StockMovementType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { StockMovementInput } from '../validators/inventoryValidator';

export interface MovementQueryParams {
  productId?: string;
  type?: StockMovementType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class InventoryService {
  public async stockIn(productId: string, data: StockMovementInput, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${productId}' not found`);
    }

    const { quantity, reason } = data;

    // Atomic database transaction
    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: {
          currentStock: { increment: quantity },
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          quantity,
          type: StockMovementType.IN,
          reason: reason || 'Stock Inward Addition',
          createdBy: userId,
        },
        include: {
          product: {
            select: { id: true, productName: true, sku: true, currentStock: true },
          },
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return { product: updatedProduct, movement };
  }

  public async stockOut(productId: string, data: StockMovementInput, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${productId}' not found`);
    }

    const { quantity, reason } = data;

    // Guard: Prevent negative stock
    if (product.currentStock < quantity) {
      throw new BadRequestError(
        `Insufficient stock for product '${product.productName}' (SKU: ${product.sku}). Available stock: ${product.currentStock}, Requested: ${quantity}`
      );
    }

    // Atomic database transaction
    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: {
          currentStock: { decrement: quantity },
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          quantity,
          type: StockMovementType.OUT,
          reason: reason || 'Manual Stock Issue',
          createdBy: userId,
        },
        include: {
          product: {
            select: { id: true, productName: true, sku: true, currentStock: true },
          },
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return { product: updatedProduct, movement };
  }

  public async getMovements(query: MovementQueryParams) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [totalCount, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, productName: true, sku: true, category: true },
          },
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      movements,
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

  public async getLowStockProducts(page = 1, limit = 10) {
    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));

    const allProducts = await prisma.product.findMany({
      orderBy: { currentStock: 'asc' },
    });

    const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);
    const totalCount = lowStockProducts.length;
    const paginated = lowStockProducts.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      products: paginated,
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
}

export const inventoryService = new InventoryService();
