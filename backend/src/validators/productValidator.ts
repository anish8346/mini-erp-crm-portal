import { z } from 'zod';

const optionalString = (schema: z.ZodString) =>
  z.preprocess((val) => (val === '' || val === null ? undefined : val), schema.optional().nullable());

export const createProductSchema = z.object({
  productName: z.string().trim().min(2, 'Product name must be at least 2 characters'),
  sku: z
    .string()
    .trim()
    .min(2, 'SKU must be at least 2 characters')
    .transform((val) => val.toUpperCase()),
  category: z.string().trim().min(2, 'Category is required'),
  unitPrice: z.number().min(0, 'Unit price must be greater than or equal to 0'),
  currentStock: z.number().int().min(0, 'Current stock must be a non-negative integer').default(0),
  minimumStock: z.number().int().min(0, 'Minimum stock must be a non-negative integer').default(0),
  warehouse: optionalString(z.string().trim()),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  lowStock: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
