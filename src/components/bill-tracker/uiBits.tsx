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
