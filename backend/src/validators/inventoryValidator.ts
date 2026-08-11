import { z } from 'zod';
import { StockMovementType } from '@prisma/client';

export const stockMovementSchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole integer')
    .positive('Quantity must be greater than 0'),
  reason: z.string().trim().optional().nullable(),
});

export const queryMovementsSchema = z.object({
  productId: z.string().optional(),
  type: z.nativeEnum(StockMovementType).optional(),
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO date-time' }).optional(),
  endDate: z.string().datetime({ message: 'endDate must be a valid ISO date-time' }).optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
