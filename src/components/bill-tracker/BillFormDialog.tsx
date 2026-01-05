"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Bill, BillFrequency } from "@/types/bill";

const FREQUENCIES: BillFrequency[] = ["weekly", "monthly", "yearly", "once"];

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type BillFormValues = {
  name: string;
  amount: string; // keep as string for input
  dueDate: string; // yyyy-mm-dd
  frequency: BillFrequency;
  isSubscription: boolean;
  paid: boolean;
};

function defaultsFromBill(bill?: Bill | null): BillFormValues {
  return {
    name: bill?.name ?? "",
    amount: bill ? String(bill.amount) : "",
    dueDate: bill
      ? toDateInputValue(bill.dueDate)
      : toDateInputValue(new Date()),
    frequency: bill?.frequency ?? "monthly",
    isSubscription: bill?.isSubscription ?? false,
    paid: bill?.paid ?? false,
  };
}

export type BillFormSubmit = (values: {
  name: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  isSubscription: boolean;
  paid: boolean;
}) => void | Promise<void>;

export function BillFormDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBill?: Bill | null;
  onSubmit: BillFormSubmit;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}) {
  const {
    open,
    onOpenChange,
    initialBill,
    onSubmit,
    isSubmitting,
    errorMessage,
  } = props;

  const [form, setForm] = React.useState<BillFormValues>(() =>
    defaultsFromBill(initialBill)
  );

  // Reset the form every time we open, and when switching which bill we're editing.
  React.useEffect(() => {
    if (open) setForm(defaultsFromBill(initialBill));
  }, [open, initialBill?.id]);

  const title = initialBill ? "Edit bill" : "Add bill";
  const desc = initialBill
    ? "Update the bill details."
    : "Create a new bill in your account.";

  const canSubmit =
    form.name.trim().length > 0 &&
    form.amount.trim().length > 0 &&
    !Number.isNaN(Number(form.amount)) &&
    Number(form.amount) >= 0 &&
    form.dueDate.trim().length === 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const due = new Date(form.dueDate + "T00:00:00");
    const amt = Number(form.amount);

    await onSubmit({
      name: form.name.trim(),
      amount: amt,
      dueDate: due,
      frequency: form.frequency,
      isSubscription: form.isSubscription,
      paid: form.paid,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-135">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bill-name">Name</Label>
            <Input
              id="bill-name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Rent, Netflix, Electric..."
              className="rounded-2xl"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bill-amount">Amount</Label>
              <Input
                id="bill-amount"
                type="number"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, amount: e.target.value }))
                }
                placeholder="0.00"
                className="rounded-2xl"
                disabled={isSubmitting}
                min={0}
                step="0.01"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bill-due">Due date</Label>
              <Input
                id="bill-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((s) => ({ ...s, dueDate: e.target.value }))
                }
                className="rounded-2xl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Frequency</Label>
            <Select
              value={form.frequency}
              onValueChange={(v) =>
                setForm((s) => ({ ...s, frequency: v as BillFrequency }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.isSubscription}
                onChange={(e) =>
                  setForm((s) => ({ ...s, isSubscription: e.target.checked }))
                }
                disabled={isSubmitting}
                className="h-4 w-4 accent-white/80"
              />
              Subscription
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.paid}
                onChange={(e) =>
                  setForm((s) => ({ ...s, paid: e.target.checked }))
                }
                disabled={isSubmitting}
                className="h-4 w-4 accent-white/80"
              />
              Mark as paid
            </label>
          </div>

          {errorMessage ? (
            <div className="text-sm text-red-400">{errorMessage}</div>
          ) : null}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-2xl"
              disabled={!canSubmit || isSubmitting}
            >
              {initialBill ? "Save changes" : "Add bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
