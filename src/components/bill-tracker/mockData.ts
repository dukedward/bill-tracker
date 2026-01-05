import type { Bill } from "@/types/bill";

export const mockBills: Bill[] = [
  {
    id: "bill_001",
    name: "Electric",
    amount: 124.56,
    dueDate: new Date(2026, 0, 15),
    frequency: "monthly",
    category: "other",
    isSubscription: false,
    paid: false,
  },
  {
    id: "bill_002",
    name: "Internet",
    amount: 89.99,
    dueDate: new Date("2026-01-20"),
    frequency: "monthly",
    category: "other",
    isSubscription: true,
    paid: true,
  },
];
