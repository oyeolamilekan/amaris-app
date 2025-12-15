import { z } from "zod";

export const createPackageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  credits: z.number().int().positive(),
  price: z.number().int().positive(), // in cents
  polarProductId: z.string().min(1),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  credits: z.number().int().positive().optional(),
  price: z.number().int().positive().optional(),
  polarProductId: z.string().min(1).optional(),
});

export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

export const updateUserCreditsSchema = z.object({
  credits: z.number().int().min(0),
});

export type UpdateUserCreditsInput = z.infer<typeof updateUserCreditsSchema>;
