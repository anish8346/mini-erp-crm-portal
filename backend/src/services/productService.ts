import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { CreateProductInput, UpdateProductInput } from '../validators/productValidator';

export interface ProductQueryParams {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export class ProductService {
  public async createProduct(data: CreateProductInput) {
    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists.`);
    }

    return prisma.product.create({
      data: {
        productName: data.productName,
        sku: data.sku,
        category: data.category,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
        warehouse: data.warehouse || null,
      },
    });
  }

  public async getProducts(query: ProductQueryParams) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.category) {
      where.category = { equals: query.category.trim(), mode: 'insensitive' };
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { productName: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Handle lowStock filtering (currentStock <= minimumStock)
    if (query.lowStock) {
      const allProducts = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { stockMovements: true, challanItems: true },
          },
        },
      });

      const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);
      const totalCount = lowStockProducts.length;
      const products = lowStockProducts.slice(skip, skip + limit);
      const totalPages = Math.ceil(totalCount / limit) || 1;

      return {
        products,
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

    // Standard pagination query
    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { stockMovements: true, challanItems: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      products,
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

  public async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { stockMovements: true, challanItems: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    return product;
  }

  public async updateProduct(id: string, data: UpdateProductInput) {
    await this.getProductById(id); // Throws if not found

    if (data.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          NOT: { id },
        },
      });

      if (existingSku) {
        throw new ConflictError(`Another product with SKU '${data.sku}' already exists.`);
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...(data.productName !== undefined && { productName: data.productName }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
        ...(data.currentStock !== undefined && { currentStock: data.currentStock }),
        ...(data.minimumStock !== undefined && { minimumStock: data.minimumStock }),
        ...(data.warehouse !== undefined && { warehouse: data.warehouse || null }),
      },
    });
  }

  public async deleteProduct(id: string) {
    await this.getProductById(id); // Throws if not found

    return prisma.product.delete({
      where: { id },
    });
  }
}

export const productService = new ProductService();
