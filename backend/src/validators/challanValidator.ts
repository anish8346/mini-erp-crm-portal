import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const challanItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),
});

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z
    .array(challanItemInputSchema)
    .min(1, 'At least one item is required to create a delivery challan'),
});

export const queryChallanSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ChallanStatus).optional(),
  customerId: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
