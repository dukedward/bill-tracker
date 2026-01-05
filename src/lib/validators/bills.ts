import { z } from "zod";

export const BillFrequencySchema = z.enum([
  "weekly",
  "monthly",
  "yearly",
  "once",
]);
export const BillCategorySchema = z.enum([
  "rent",
  "utilities",
  "subscriptions",
  "credit",
  "insurance",
  "other",
]);

const IsoDateString = z
  .string()
  .min(1, "Due date is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Due date must be a valid ISO date string",
  });

export const CreateBillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  amount: z.number().min(0, "Amount must be >= 0"),
  dueDate: IsoDateString,
  frequency: BillFrequencySchema,
  category: BillCategorySchema.default("other"),
  isSubscription: z.boolean().default(false),
  paid: z.boolean().default(false),
  vendor: z
    .string()
    .trim()
    .max(120, "Vendor is too long")
    .optional()
    .default(""),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes are too long")
    .optional()
    .default(""),
});

export const UpdateBillSchema = CreateBillSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  {
    message: "At least one field is required",
  }
);

export function validationErrorResponse(result: {
  success: boolean;
  error?: z.ZodError;
}) {
  if (result.success) return null;

  const flat = result.error!.flatten();
  return {
    error: "Validation failed",
    fieldErrors: flat.fieldErrors,
    formErrors: flat.formErrors,
  };
}

export type CreateBillInput = z.infer<typeof CreateBillSchema>;
export type UpdateBillInput = z.infer<typeof UpdateBillSchema>;

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
