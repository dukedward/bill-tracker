export type IncomeFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "once"
  | "other";

export interface Income {
  id: string;
  name: string;
  amount: number;
  date: Date;
  frequency?: IncomeFrequency;
  source?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IncomeDTO {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO string
  frequency?: IncomeFrequency;
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateIncomeDTO = Omit<IncomeDTO, "id" | "createdAt" | "updatedAt">;
export type UpdateIncomeDTO = Partial<CreateIncomeDTO>;

export function incomeFromDTO(dto: IncomeDTO): Income {
  return {
    id: dto.id,
    name: dto.name,
    amount: dto.amount,
    date: new Date(dto.date),
    frequency: dto.frequency,
    source: dto.source ?? "",
    notes: dto.notes ?? "",
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}

export function incomeToCreateDTO(input: {
  name: string;
  amount: number;
  date: Date;
  frequency?: IncomeFrequency;
  source?: string;
  notes?: string;
}): CreateIncomeDTO {
  return {
    name: input.name.trim(),
    amount: Number(input.amount) || 0,
    date: input.date.toISOString(),
    frequency: input.frequency,
    source: input.source?.trim() ?? "",
    notes: input.notes?.trim() ?? "",
  };
}

export function incomeToUpdateDTO(
  input: Partial<{
    name: string;
    amount: number;
    date: Date;
    frequency?: IncomeFrequency;
    source?: string;
    notes?: string;
  }>,
): UpdateIncomeDTO {
  const dto: UpdateIncomeDTO = {};
  if (input.name !== undefined) dto.name = input.name.trim();
  if (input.amount !== undefined) dto.amount = Number(input.amount) || 0;
  if (input.date !== undefined) dto.date = input.date.toISOString();
  if (input.frequency !== undefined) dto.frequency = input.frequency;
  if (input.source !== undefined) dto.source = input.source.trim();
  if (input.notes !== undefined) dto.notes = input.notes.trim();
  return dto;
}
