import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

const optionalString = (schema: z.ZodString) =>
  z.preprocess((val) => (val === '' || val === null ? undefined : val), schema.optional().nullable());

export const createCustomerSchema = z.object({
  customerName: z.string().trim().min(2, 'Customer name must be at least 2 characters'),
  mobileNumber: z
    .string()
    .trim()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number exceeds 15 digits'),
  email: optionalString(z.string().trim().email('Invalid email address')),
  businessName: optionalString(z.string().trim()),
  gstNumber: optionalString(
    z
      .string()
      .trim()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format (15 characters required)')
  ),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  address: optionalString(z.string().trim()),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: optionalString(z.string().trim()),
  notes: optionalString(z.string().trim()),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const queryCustomerSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  customerType: z.nativeEnum(CustomerType).optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

export const createFollowUpSchema = z.object({
  note: z.string().trim().min(2, 'Follow-up note must be at least 2 characters'),
  followUpDate: z.string().trim().min(1, 'followUpDate is required'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
