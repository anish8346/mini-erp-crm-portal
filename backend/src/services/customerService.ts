import { Prisma, CustomerStatus, CustomerType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateFollowUpInput,
} from '../validators/customerValidator';

export interface CustomerQueryParams {
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
  page?: number;
  limit?: number;
}

export class CustomerService {
  public async createCustomer(data: CreateCustomerInput) {
    return prisma.customer.create({
      data: {
        customerName: data.customerName,
        mobileNumber: data.mobileNumber,
        email: data.email || null,
        businessName: data.businessName || null,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType,
        address: data.address || null,
        status: data.status,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.notes || null,
      },
    });
  }

  public async getCustomers(query: CustomerQueryParams) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerType) {
      where.customerType = query.customerType;
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { customerName: { contains: searchTerm, mode: 'insensitive' } },
        { mobileNumber: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { businessName: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [totalCount, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { followUps: true, challans: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      customers,
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

  public async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { challans: true, followUps: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID '${id}' not found`);
    }

    return customer;
  }

  public async updateCustomer(id: string, data: UpdateCustomerInput) {
    await this.getCustomerById(id); // Throws if not found

    return prisma.customer.update({
      where: { id },
      data: {
        ...(data.customerName !== undefined && { customerName: data.customerName }),
        ...(data.mobileNumber !== undefined && { mobileNumber: data.mobileNumber }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.businessName !== undefined && { businessName: data.businessName || null }),
        ...(data.gstNumber !== undefined && { gstNumber: data.gstNumber || null }),
        ...(data.customerType !== undefined && { customerType: data.customerType }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.followUpDate !== undefined && {
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    });
  }

  public async deleteCustomer(id: string) {
    await this.getCustomerById(id); // Throws if not found

    // Check if customer has associated sales challans
    const challanCount = await prisma.challan.count({
      where: { customerId: id },
    });

    if (challanCount > 0) {
      throw new ConflictError(
        `Customer cannot be deleted because they are associated with ${challanCount} sales delivery challan(s).`
      );
    }

    // Check if customer has follow-up logs
    const followUpCount = await prisma.followUp.count({
      where: { customerId: id },
    });

    if (followUpCount > 0) {
      throw new ConflictError(
        `Customer cannot be deleted because they have ${followUpCount} associated CRM follow-up record(s).`
      );
    }

    return prisma.customer.delete({
      where: { id },
    });
  }

  public async addFollowUp(customerId: string, data: CreateFollowUpInput, createdBy: string) {
    await this.getCustomerById(customerId); // Throws if not found

    const followUpDate = new Date(data.followUpDate);

    // Execute in transaction: create followUp & update customer followUpDate
    const [followUp] = await prisma.$transaction([
      prisma.followUp.create({
        data: {
          customerId,
          note: data.note,
          followUpDate,
          createdBy,
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.customer.update({
        where: { id: customerId },
        data: { followUpDate },
      }),
    ]);

    return followUp;
  }

  public async getFollowUps(customerId: string) {
    await this.getCustomerById(customerId); // Throws if not found

    return prisma.followUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}

export const customerService = new CustomerService();
