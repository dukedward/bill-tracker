import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, RefreshCwOff, Banknote, BanknoteX } from "lucide-react";

export function SubBadge({ sub }: { sub: boolean }) {
  const Icon = sub ? RefreshCw : RefreshCwOff;
  const label = sub ? "True" : "False";
  const variant = sub ? "default" : "secondary";
  return (
    <Badge variant={variant} className="gap-1 px-2 py-1 text-md">
      <Icon className="h-5 w-5" />
      {label}
    </Badge>
  );
}

export function PaidBadge({ paid }: { paid: boolean }) {
  const Icon = paid ? Banknote : BanknoteX;
  const label = paid ? "True" : "False";
  const variant = paid ? "default" : "destructive";
  return (
    <Badge variant={variant} className="gap-1 px-2 py-1 text-md">
      <Icon className="h-5 w-5" />
      {label}
    </Badge>
  );
}

export function fmtCurrency(value: number, currency = "USD"): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function fmtDateShort(d: Date): string {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
