import { z } from "zod";

export const IncomeFrequencySchema = z.enum([
  "weekly",
  "biweekly",
  "monthly",
  "once",
  "other",
]);

const IncomeFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  amount: z.coerce.number().min(0, "Amount must be >= 0"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine(
      (s) => !Number.isNaN(new Date(s).getTime()),
      "Date must be a valid ISO date string",
    ),
  frequency: IncomeFrequencySchema.optional(),
  source: z.string().trim().max(120, "Source is too long").optional(),
  notes: z.string().trim().max(2000, "Notes are too long").optional(),
});

export const CreateIncomeSchema = IncomeFieldsSchema.extend({
  source: z
    .string()
    .trim()
    .max(120, "Source is too long")
    .optional()
    .default(""),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes are too long")
    .optional()
    .default(""),
});

export const UpdateIncomeSchema = IncomeFieldsSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  "At least one field must be provided",
);
