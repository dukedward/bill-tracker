import { BillFrequency } from "@/types/bill";

export const calculateNextDueDate = (
  current: Date,
  frequency: BillFrequency,
): Date => {
  const next = new Date(current);

  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

export function formatDueDate(dueDate: Date): string {
  // If dueDate ever comes from JSON, it may be a string — handle that elsewhere when you load data.
  return dueDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}
