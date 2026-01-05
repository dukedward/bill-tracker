"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtCurrency } from "@/components/bill-tracker/uiBits";
import type { Bill } from "@/types/bill";
import { cn } from "@/lib/utils";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function SummaryCards(props: { bills: Bill[]; className?: string }) {
  const { bills, className } = props;

  const now = startOfDay(new Date());

  const summary = React.useMemo(() => {
    const total = bills.length;
    const paid = bills.filter((b) => b.paid).length;
    const unpaid = total - paid;

    const overdue = bills.filter(
      (b) => !b.paid && startOfDay(b.dueDate) < now
    ).length;

    const unpaidTotal = bills
      .filter((b) => !b.paid)
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    return { total, paid, unpaid, overdue, unpaidTotal };
  }, [bills, now]);

  return (
    <div className={cn("grid gap-4 md:grid-cols-4", className)}>
      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Total bills
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {summary.total}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Unpaid
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {summary.unpaid}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {summary.overdue}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Unpaid total
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {fmtCurrency(summary.unpaidTotal)}
        </CardContent>
      </Card>
    </div>
  );
}
