export type BillFrequency = "weekly" | "monthly" | "yearly" | "once";
export type BillCategory =
  | "rent"
  | "utilities"
  | "subscriptions"
  | "credit"
  | "insurance"
  | "other";

/**
 * Bill as used in the client UI (Dates are real Date objects).
 */
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  category: BillCategory;
  isSubscription: boolean;
  paid: boolean;
  vendor?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Bill as sent over the network (Dates are ISO strings).
 */
export interface BillDTO {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string
  frequency: BillFrequency;
  category: BillCategory;
  isSubscription: boolean;
  paid: boolean;
  vendor?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateBillDTO = Omit<BillDTO, "id" | "createdAt" | "updatedAt">;
export type UpdateBillDTO = Partial<CreateBillDTO>;

export function billFromDTO(dto: BillDTO): Bill {
  return {
    id: dto.id,
    name: dto.name,
    amount: dto.amount,
    dueDate: new Date(dto.dueDate),
    frequency: dto.frequency,
    category: dto.category ?? "other",
    isSubscription: dto.isSubscription,
    paid: dto.paid,
    vendor: dto.vendor ?? "",
    notes: dto.notes ?? "",
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}

export function billToCreateDTO(input: {
  name: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  category: BillCategory;
  isSubscription: boolean;
  paid: boolean;
  vendor?: string;
  notes?: string;
}): CreateBillDTO {
  return {
    name: input.name,
    amount: input.amount,
    dueDate: input.dueDate.toISOString(),
    frequency: input.frequency,
    category: input.category,
    isSubscription: input.isSubscription,
    paid: input.paid,
    vendor: input.vendor ?? "",
    notes: input.notes ?? "",
  };
}

export function billToUpdateDTO(
  input: Partial<{
    name: string;
    amount: number;
    dueDate: Date;
    frequency: BillFrequency;
    category: BillCategory;
    isSubscription: boolean;
    paid: boolean;
    vendor?: string;
    notes?: string;
  }>
): UpdateBillDTO {
  const out: UpdateBillDTO = { ...input } as UpdateBillDTO;
  if (input.dueDate instanceof Date) {
    out.dueDate = input.dueDate.toISOString();
  }
  if (input.vendor !== undefined) out.vendor = input.vendor ?? "";
  if (input.notes !== undefined) out.notes = input.notes ?? "";
  return out;
}
