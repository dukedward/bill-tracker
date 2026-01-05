import { z } from "zod";

export const BillFrequencySchema = z.enum(["weekly", "monthly", "yearly", "once"]);

const IsoDateString = z
  .string()
  .min(1)
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" });

export const CreateBillSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  amount: z.number().min(0, "Amount must be >= 0"),
  dueDate: IsoDateString,
  frequency: BillFrequencySchema,
  isSubscription: z.boolean().default(false),
  paid: z.boolean().default(false),
});

export const UpdateBillSchema = CreateBillSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  message: "At least one field is required",
});

export function zodErrorToResponse(err: z.ZodError) {
  return {
    error: "Validation failed",
    fields: err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    })),
  };
}
