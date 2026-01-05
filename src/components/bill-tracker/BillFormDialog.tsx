"use client";

import * as React from "react";
import type { Bill, BillCategory, BillFrequency } from "@/types/bill";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type BillFormSubmit = (values: {
  name: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  category: BillCategory;
  isSubscription: boolean;
  paid: boolean;
  vendor?: string;
  notes?: string;
}) => void | Promise<void>;

const CATEGORY_OPTIONS: { value: BillCategory; label: string }[] = [
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "credit", label: "Credit" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

const FREQ_OPTIONS: { value: BillFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "once", label: "Once" },
];

function dateToInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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

  const isEdit = Boolean(initialBill?.id);

  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState<number>(0);
  const [dueDate, setDueDate] = React.useState<Date>(new Date());
  const [frequency, setFrequency] = React.useState<BillFrequency>("monthly");
  const [category, setCategory] = React.useState<BillCategory>("other");
  const [isSubscription, setIsSubscription] = React.useState<boolean>(false);
  const [paid, setPaid] = React.useState<boolean>(false);
  const [vendor, setVendor] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;

    if (initialBill) {
      setName(initialBill.name ?? "");
      setAmount(Number(initialBill.amount ?? 0));
      setDueDate(
        initialBill.dueDate instanceof Date
          ? initialBill.dueDate
          : new Date(initialBill.dueDate)
      );
      setFrequency(initialBill.frequency ?? "monthly");
      setCategory(initialBill.category ?? "other");
      setIsSubscription(Boolean(initialBill.isSubscription));
      setPaid(Boolean(initialBill.paid));
      setVendor(initialBill.vendor ?? "");
      setNotes(initialBill.notes ?? "");
    } else {
      setName("");
      setAmount(0);
      setDueDate(new Date());
      setFrequency("monthly");
      setCategory("other");
      setIsSubscription(false);
      setPaid(false);
      setVendor("");
      setNotes("");
    }
  }, [open, initialBill]);

  const canSubmit =
    name.trim().length > 0 &&
    Number.isFinite(amount) &&
    amount >= 0 &&
    dueDate instanceof Date &&
    !Number.isNaN(dueDate.getTime());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    await onSubmit({
      name: name.trim(),
      amount: Number(amount),
      dueDate,
      frequency,
      category,
      isSubscription,
      paid,
      vendor: vendor.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-lg bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? "Edit bill" : "Add bill"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details for this bill.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bill-name">Name</Label>
            <Input
              id="bill-name"
              className="rounded-2xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rent, Electric, Netflix…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bill-amount">Amount</Label>
              <Input
                id="bill-amount"
                className="rounded-2xl"
                type="number"
                step="0.01"
                value={Number.isFinite(amount) ? amount : 0}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bill-due">Due date</Label>
              <Input
                id="bill-due"
                className="rounded-2xl"
                type="date"
                value={dateToInputValue(dueDate)}
                onChange={(e) => setDueDate(new Date(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as BillFrequency)}
              >
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
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as BillCategory)}
              >
                <SelectTrigger className="rounded-2xl w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-input bg-background px-3 py-2 text-foreground">
              <div>
                <div className="text-sm font-medium">Subscription</div>
                <div className="text-xs">Recurring service/plan</div>
              </div>
              <Switch
                checked={isSubscription}
                onCheckedChange={(v) => setIsSubscription(Boolean(v))}
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-input bg-background px-3 py-2 text-foreground">
              <div>
                <div className="text-sm font-medium">Paid</div>
                <div className="text-xs">Mark this bill as paid</div>
              </div>
              <Switch
                checked={paid}
                onCheckedChange={(v) => setPaid(Boolean(v))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-vendor">Vendor</Label>
            <Input
              id="bill-vendor"
              className="rounded-2xl"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Landlord, Duke Energy, Netflix…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-notes">Notes</Label>
            <Textarea
              id="bill-notes"
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
            <Button
              type="submit"
              className="rounded-2xl"
              disabled={!canSubmit || Boolean(isSubmitting)}
            >
              {isEdit ? "Save changes" : "Create bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
