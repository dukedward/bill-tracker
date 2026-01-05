"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useBills } from "@/components/bill-tracker/hooks";
import type { Bill } from "@/types/bill";
import { fmtCurrency } from "@/components/bill-tracker/uiBits";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatMonthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function weekBucketLabel(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun
  const mondayOffset = (day + 6) % 7;
  x.setDate(x.getDate() - mondayOffset);
  return x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function sumAmount(bills: Bill[]) {
  return bills.reduce((s, b) => s + (Number(b.amount) || 0), 0);
}

function makePaidData(bills: Bill[]) {
  const paid = bills.filter((b) => b.paid).length;
  const unpaid = bills.length - paid;
  return [
    { name: "Paid", value: paid },
    { name: "Unpaid", value: unpaid },
  ];
}

function makeCategoryData(bills: Bill[]) {
  const totals = new Map<string, number>();
  for (const b of bills) {
    const k = b.category ?? "other";
    totals.set(k, (totals.get(k) || 0) + (Number(b.amount) || 0));
  }
  const order = [
    "rent",
    "utilities",
    "subscriptions",
    "credit",
    "insurance",
    "other",
  ];
  return order
    .filter((k) => totals.has(k))
    .map((k) => ({ name: k, value: totals.get(k) || 0 }));
}

function makeUpcomingWeeklyTotals(bills: Bill[]) {
  const now = startOfDay(new Date());
  const end = new Date(now);
  end.setDate(end.getDate() + 30);

  const relevant = bills.filter((b) => {
    const d = startOfDay(b.dueDate);
    return d >= now && d <= end;
  });

  const map = new Map<string, number>();
  for (const b of relevant) {
    const k = weekBucketLabel(b.dueDate);
    map.set(k, (map.get(k) || 0) + (Number(b.amount) || 0));
  }

  const rows = Array.from(map.entries()).map(([label, total]) => {
    const dt = new Date(label + " " + new Date().getFullYear());
    return { label, total, sort: dt.getTime() };
  });
  rows.sort((a, b) => a.sort - b.sort);

  return rows.map((r) => ({ week: r.label, total: r.total }));
}

function makeMonthlyTotals(bills: Bill[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const map = new Map<string, number>();
  for (const b of bills) {
    const d = b.dueDate;
    if (d < start) continue;
    const k = formatMonthKey(d);
    map.set(k, (map.get(k) || 0) + (Number(b.amount) || 0));
  }

  const keys: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    keys.push(formatMonthKey(d));
  }

  return keys.map((k) => ({
    month: formatMonthLabel(k),
    total: map.get(k) || 0,
  }));
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const canUseApp = Boolean(user && !authLoading);

  const billsQ = useBills(canUseApp);
  const bills = billsQ.data ?? [];

  const paidData = React.useMemo(() => makePaidData(bills), [bills]);
  const categoryData = React.useMemo(() => makeCategoryData(bills), [bills]);
  const weeklyUpcoming = React.useMemo(
    () => makeUpcomingWeeklyTotals(bills),
    [bills]
  );
  const monthlyTotals = React.useMemo(() => makeMonthlyTotals(bills), [bills]);

  const unpaidBills = React.useMemo(
    () => bills.filter((b) => !b.paid),
    [bills]
  );
  const unpaidTotal = React.useMemo(
    () => sumAmount(unpaidBills),
    [unpaidBills]
  );

  if (!canUseApp) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                Sign in to view dashboard
              </CardTitle>
              <CardDescription>
                The dashboard is personalized per account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className="inline-flex">
                <Button variant="outline" className="rounded-2xl">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to bills
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-foreground">
              Insights from your bills.
            </p>
          </div>

          <Link href="/" className="inline-flex">
            <Button variant="outline" className="rounded-2xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <Separator className="my-6" />

        {billsQ.isLoading ? (
          <div className="text-sm text-foreground">Loading…</div>
        ) : billsQ.isError ? (
          <div className="text-sm text-destructive">Failed to load bills.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Bills
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {bills.length}
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Unpaid bills
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {unpaidBills.length}
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Unpaid total
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {fmtCurrency(unpaidTotal)}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Paid vs Unpaid</CardTitle>
                  <CardDescription>
                    Count of bills by payment status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={paidData}
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Spend by Category</CardTitle>
                  <CardDescription>
                    Total amount grouped by category.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label
                      />
                      <Tooltip
                        formatter={(v: any) => fmtCurrency(Number(v) || 0)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Upcoming (Next 30 days)</CardTitle>
                  <CardDescription>
                    Totals grouped by week start.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyUpcoming}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        formatter={(v: any) => fmtCurrency(Number(v) || 0)}
                      />
                      <Bar dataKey="total" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Monthly totals (Last 6 months)</CardTitle>
                  <CardDescription>Based on bill due dates.</CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTotals}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        formatter={(v: any) => fmtCurrency(Number(v) || 0)}
                      />
                      <Line type="monotone" dataKey="total" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
