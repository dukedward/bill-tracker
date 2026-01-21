"use client";

import * as React from "react";
import type { Income, IncomeFrequency } from "@/types/income";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type IncomeFormSubmit = (values: {
  name: string;
  amount: number;
  date: Date;
  frequency?: IncomeFrequency;
  source?: string;
  notes?: string;
}) => void | Promise<void>;

const FREQ_OPTIONS: { value: IncomeFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "once", label: "Once" },
  { value: "other", label: "Other" },
];

function dateToInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function IncomeFormDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIncome?: Income | null;
  onSubmit: IncomeFormSubmit;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}) {
  const {
    open,
    onOpenChange,
    initialIncome,
    onSubmit,
    isSubmitting,
    errorMessage,
  } = props;

  const isEdit = Boolean(initialIncome?.id);

  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [date, setDate] = React.useState<Date>(new Date());
  const [frequency, setFrequency] = React.useState<IncomeFrequency>("monthly");
  const [source, setSource] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;

    if (initialIncome) {
      setName(initialIncome.name ?? "");
      setAmount(
        initialIncome.amount !== undefined && initialIncome.amount !== null
          ? String(initialIncome.amount)
          : ""
      );
      setDate(initialIncome.date instanceof Date ? initialIncome.date : new Date(initialIncome.date));
      setFrequency(initialIncome.frequency ?? "monthly");
      setSource(initialIncome.source ?? "");
      setNotes(initialIncome.notes ?? "");
    } else {
      setName("");
      setAmount("");
      setDate(new Date());
      setFrequency("monthly");
      setSource("");
      setNotes("");
    }
  }, [open, initialIncome]);

  const amountNumber = Number(amount.trim());

  const canSubmit =
    name.trim().length > 0 &&
    Number.isFinite(amountNumber) &&
    amountNumber >= 0 &&
    date instanceof Date &&
    !Number.isNaN(date.getTime());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    await onSubmit({
      name: name.trim(),
      amount: amountNumber,
      date,
      frequency,
      source: source.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-lg bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? "Edit income" : "Add income"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add an income source (paycheck, freelance, etc.).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-name">Name</Label>
            <Input
              id="income-name"
              className="rounded-2xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Paycheck, Freelance…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income-amount">Amount</Label>
              <Input
                id="income-amount"
                className="rounded-2xl"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-date">Date</Label>
              <Input
                id="income-date"
                className="rounded-2xl"
                type="date"
                value={dateToInputValue(date)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const [y, m, d] = v.split("-").map(Number);
                  setDate(new Date(y, (m ?? 1) - 1, d ?? 1));
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as IncomeFrequency)}>
                <SelectTrigger className="rounded-2xl w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQ_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-source">Source</Label>
              <Input
                id="income-source"
                className="rounded-2xl"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Employer, Client…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-notes">Notes</Label>
            <Textarea
              id="income-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              className="bg-input"
            />
          </div>

          {errorMessage ? (
            <div className="text-sm text-destructive">{errorMessage}</div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-2xl" disabled={!canSubmit || Boolean(isSubmitting)}>
              {isEdit ? "Save changes" : "Create income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
