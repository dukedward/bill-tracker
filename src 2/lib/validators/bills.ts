import { z } from "zod";

export const BillFrequencySchema = z.enum(["weekly", "monthly", "yearly", "once"]);
export const BillCategorySchema = z.enum([
  "rent",
  "utilities",
  "subscriptions",
  "credit",
  "insurance",
  "other",
]);

/**
 * Base bill fields (NO defaults here).
 * Defaults are applied only for CREATE, never for UPDATE.
 */
const BillFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0, "Amount must be >= 0"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), "Due date must be a valid ISO date string"),
  frequency: BillFrequencySchema,
  category: BillCategorySchema,
  isSubscription: z.boolean(),
  paid: z.boolean(),
  vendor: z.string().trim().max(120, "Vendor is too long").optional(),
  notes: z.string().trim().max(2000, "Notes are too long").optional(),
});

// CREATE: apply defaults here ✅
export const CreateBillSchema = BillFieldsSchema.extend({
  category: BillCategorySchema.default("other"),
  vendor: z.string().trim().max(120, "Vendor is too long").optional().default(""),
  notes: z.string().trim().max(2000, "Notes are too long").optional().default(""),
});

// UPDATE: partial but NO defaults ✅ (prevents wiping vendor/notes/subscription/etc)
export const UpdateBillSchema = BillFieldsSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  "At least one field must be provided"
);

export type CreateBillInput = z.infer<typeof CreateBillSchema>;
export type UpdateBillInput = z.infer<typeof UpdateBillSchema>;

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function formatZodError(error: z.ZodError) {
  const flat = error.flatten();
  return {
    error: "Validation failed",
    fieldErrors: flat.fieldErrors,
    formErrors: flat.formErrors,
  };
}
