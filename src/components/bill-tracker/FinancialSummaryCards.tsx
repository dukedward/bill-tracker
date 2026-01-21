"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtCurrency } from "@/components/bill-tracker/uiBits";
import type { Bill } from "@/types/bill";
import type { Income } from "@/types/income";
import { cn } from "@/lib/utils";

export function FinancialSummaryCards(props: {
  bills: Bill[];
  income: Income[];
  className?: string;
}) {
  const { bills, income, className } = props;

  const totals = React.useMemo(() => {
    const totalIncome = income.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const paidBillsTotal = bills
      .filter((b) => b.paid)
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    const remaining = totalIncome - paidBillsTotal;
    return { totalIncome, paidBillsTotal, remaining };
  }, [bills, income]);

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Total income
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {fmtCurrency(totals.totalIncome)}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Paid bills total
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {fmtCurrency(totals.paidBillsTotal)}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Remaining income
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("text-2xl font-semibold", totals.remaining < 0 && "text-destructive")}>
          {fmtCurrency(totals.remaining)}
        </CardContent>
      </Card>
    </div>
  );
}
