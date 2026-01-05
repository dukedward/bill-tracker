export type BillFrequency = "weekly" | "monthly" | "yearly" | "once";

/**
 * Bill as used in the client UI (Dates are real Date objects).
 */
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  isSubscription: boolean;
  paid: boolean;
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
  isSubscription: boolean;
  paid: boolean;
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
    isSubscription: dto.isSubscription,
    paid: dto.paid,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}

export function billToCreateDTO(input: {
  name: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  isSubscription: boolean;
  paid: boolean;
}): CreateBillDTO {
  return {
    ...input,
    dueDate: input.dueDate.toISOString(),
  };
}

export function billToUpdateDTO(input: Partial<{
  name: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  isSubscription: boolean;
  paid: boolean;
}>): UpdateBillDTO {
  const out: UpdateBillDTO = { ...input } as UpdateBillDTO;
  if (input.dueDate instanceof Date) {
    out.dueDate = input.dueDate.toISOString();
  }
  return out;
}
