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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

import { useAuth } from "@/lib/useAuth";
import {
  useBills,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
  useToggleBillPaid,
} from "@/components/bill-tracker/hooks";
import {
  useIncome,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
} from "@/components/income-tracker/hooks";
import type { Bill, BillCategory } from "@/types/bill";
import type { Income, IncomeFrequency } from "@/types/income";
import { billToCreateDTO, billToUpdateDTO } from "@/types/bill";
import { incomeToCreateDTO, incomeToUpdateDTO } from "@/types/income";
import { BillFormDialog } from "@/components/bill-tracker/BillFormDialog";
import { IncomeFormDialog } from "@/components/income-tracker/IncomeFormDialog";
import { SummaryCards } from "@/components/bill-tracker/SummaryCards";
import {
  FiltersBar,
  type BillsSort,
  type BillsStatusFilter,
  type BillsCategoryFilter,
} from "@/components/bill-tracker/FiltersBar";
import { BillsTable } from "@/components/bill-tracker/BillsTable";
import { IncomeTable } from "@/components/income-tracker/IncomeTable";
import { IncomeFiltersBar } from "@/components/income-tracker/IncomeFiltersBar";
import { FinancialSummaryCards } from "@/components/bill-tracker/FinancialSummaryCards";

function applyFilters(
  bills: Bill[],
  search: string,
  status: BillsStatusFilter,
  category: BillsCategoryFilter,
): Bill[] {
  const s = search.trim().toLowerCase();

  return bills.filter((b) => {
    if (status === "paid" && !b.paid) return false;
    if (status === "unpaid" && b.paid) return false;

    if (category !== "all" && b.category !== category) return false;

    if (!s) return true;
    const q = `${b.name} ${b.vendor ?? ""}`.toLowerCase();
    return q.includes(s);
  });
}

function applySort(bills: Bill[], sort: BillsSort): Bill[] {
  const copy = [...bills];

  switch (sort) {
    case "dueDateAsc":
      copy.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      break;
    case "dueDateDesc":
      copy.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
      break;
    case "amountAsc":
      copy.sort((a, b) => (a.amount || 0) - (b.amount || 0));
      break;
    case "amountDesc":
      copy.sort((a, b) => (b.amount || 0) - (a.amount || 0));
      break;
    case "nameAsc":
      copy.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "nameDesc":
      copy.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break;
  }

  return copy;
}

export default function Page() {
  const { user, loading: authLoading } = useAuth();

  const canUseApp = Boolean(user && !authLoading);

  const incomeQ = useIncome(canUseApp);
  const createIncomeM = useCreateIncome();
  const updateIncomeM = useUpdateIncome();
  const deleteIncomeM = useDeleteIncome();

  const billsQ = useBills(canUseApp);
  const createM = useCreateBill();
  const updateM = useUpdateBill();
  const delM = useDeleteBill();
  const togglePaidM = useToggleBillPaid();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Bill | null>(null);
  const [dialogError, setDialogError] = React.useState<string | null>(null);

  const [incomeDialogOpen, setIncomeDialogOpen] = React.useState(false);
  const [incomeEditing, setIncomeEditing] = React.useState<Income | null>(null);
  const [incomeDialogError, setIncomeDialogError] = React.useState<
    string | null
  >(null);

  const [incomeSearch, setIncomeSearch] = React.useState("");

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<BillsStatusFilter>("all");
  const [category, setCategory] = React.useState<BillsCategoryFilter>("all");
  const [sort, setSort] = React.useState<BillsSort>("dueDateAsc");

  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const bills = billsQ.data ?? [];
  const income = incomeQ.data ?? [];
  const filteredSortedBills = React.useMemo(() => {
    const filtered = applyFilters(bills, search, status, category);
    return applySort(filtered, sort);
  }, [bills, search, status, category, sort]);

  const filteredIncome = React.useMemo(() => {
    const s = incomeSearch.trim().toLowerCase();
    if (!s) return income;
    return income.filter((i) => {
      const hay = `${i.name ?? ""} ${i.source ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [income, incomeSearch]);

  function openCreate() {
    setEditing(null);
    setDialogError(null);
    setDialogOpen(true);
  }

  function openEdit(b: Bill) {
    setEditing(b);
    setDialogError(null);
    setDialogOpen(true);
  }

  function openIncomeEdit(i: Income) {
    setIncomeEditing(i);
    setIncomeDialogError(null);
    setIncomeDialogOpen(true);
  }

  function openIncomeNew() {
    setIncomeEditing(null);
    setIncomeDialogError(null);
    setIncomeDialogOpen(true);
  }

  async function handleSubmit(values: {
    name: string;
    amount: number;
    dueDate: Date;
    frequency: Bill["frequency"];
    category: BillCategory;
    isSubscription: boolean;
    paid: boolean;
    vendor?: string;
    notes?: string;
  }) {
    if (!canUseApp) return;

    setDialogError(null);

    try {
      if (editing?.id) {
        await updateM.mutateAsync({
          id: editing.id,
          patch: billToUpdateDTO(values),
        });
      } else {
        await createM.mutateAsync(billToCreateDTO(values));
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (e: any) {
      setDialogError(e?.message || "Something went wrong.");
    }
  }

  async function handleIncomeSubmit(values: {
    name: string;
    amount: number;
    date: Date;
    frequency?: IncomeFrequency;
    source?: string;
    notes?: string;
  }) {
    setIncomeDialogError(null);

    try {
      if (incomeEditing?.id) {
        const patch = incomeToUpdateDTO(values);
        const keys = Object.keys(patch);
        if (!keys.length) {
          setIncomeDialogOpen(false);
          setIncomeEditing(null);
          return;
        }
        await updateIncomeM.mutateAsync({ id: incomeEditing.id, patch });
      } else {
        const dto = incomeToCreateDTO(values);
        await createIncomeM.mutateAsync(dto);
      }

      setIncomeDialogOpen(false);
      setIncomeEditing(null);
    } catch (err) {
      setIncomeDialogError(
        err instanceof Error ? err.message : "Failed to save income",
      );
    }
  }

  async function handleIncomeDelete(id: string) {
    setIncomeDialogError(null);
    try {
      await deleteIncomeM.mutateAsync(id);
    } catch (err) {
      setIncomeDialogError(
        err instanceof Error ? err.message : "Failed to delete income",
      );
    }
  }

  function handleDelete(id: string) {
    delM.mutate(id);
  }

  function handleTogglePaid(b: Bill, nextPaid: boolean) {
    setTogglingId(b.id);
    togglePaidM.mutate(
      { id: b.id, paid: nextPaid },
      {
        onSettled: () => setTogglingId(null),
      },
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background pt-4">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Bill Tracker
            </h1>
            <p className="mt-1 text-sm text-forground">
              Track bills, due dates, subscriptions, and payment status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="inline-flex">
              <Button
                variant="outline"
                className="rounded-2xl text-foreground"
                disabled={!canUseApp}
              >
                Dashboard
              </Button>
            </Link>

            <Button
              className="rounded-2xl"
              onClick={openCreate}
              disabled={!canUseApp}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Bill
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {!canUseApp ? (
          <Card className="rounded-3xl text-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Sign in to continue</CardTitle>
              <CardDescription>
                Use the Login button in the top bar. Your bills are stored
                securely per account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                Once you sign in, this page will load your bills.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <SummaryCards bills={bills} />
            <FinancialSummaryCards bills={bills} income={income} />

            <Tabs defaultValue="bills" className="space-y-6">
              <TabsList>
                <TabsTrigger value="bills">Bills</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
              </TabsList>

              <TabsContent value="bills" className="space-y-6">
                <Card className="rounded-3xl text-foreground">
                  <CardHeader>
                    <CardTitle className="text-2xl">Your bills</CardTitle>
                    <CardDescription>
                      Search, add, edit, and delete bills.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FiltersBar
                      search={search}
                      onSearchChange={setSearch}
                      status={status}
                      onStatusChange={setStatus}
                      category={category}
                      onCategoryChange={setCategory}
                      sort={sort}
                      onSortChange={setSort}
                    />

                    {billsQ.isLoading ? (
                      <div className="text-sm text-foreground">
                        Loading bills…
                      </div>
                    ) : billsQ.isError ? (
                      <div className="text-sm text-destructive">
                        Failed to load bills.
                      </div>
                    ) : (
                      <BillsTable
                        bills={filteredSortedBills}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onTogglePaid={handleTogglePaid}
                        isEditingOrDeleting={
                          createM.isPending ||
                          updateM.isPending ||
                          delM.isPending
                        }
                        isToggling={togglePaidM.isPending}
                        togglingId={togglingId}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="income" className="space-y-6">
                <Card className="rounded-3xl text-foreground">
                  <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle className="text-2xl">Your income</CardTitle>
                      <CardDescription>
                        Add, search, edit, and delete income entries.
                      </CardDescription>
                    </div>
                    <Button
                      className="rounded-2xl"
                      onClick={openIncomeNew}
                      disabled={!canUseApp}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add income
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <IncomeFiltersBar
                      search={incomeSearch}
                      onSearchChange={setIncomeSearch}
                    />

                    {incomeDialogError ? (
                      <div className="text-sm text-destructive">
                        {incomeDialogError}
                      </div>
                    ) : null}

                    {incomeQ.isLoading ? (
                      <div className="text-sm text-foreground">
                        Loading income…
                      </div>
                    ) : incomeQ.isError ? (
                      <div className="text-sm text-destructive">
                        Failed to load income.
                      </div>
                    ) : (
                      <IncomeTable
                        income={filteredIncome}
                        onEdit={openIncomeEdit}
                        onDelete={handleIncomeDelete}
                        isEditingOrDeleting={
                          createIncomeM.isPending ||
                          updateIncomeM.isPending ||
                          deleteIncomeM.isPending
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <BillFormDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) setEditing(null);
          }}
          initialBill={editing}
          onSubmit={handleSubmit}
          isSubmitting={createM.isPending || updateM.isPending}
          errorMessage={dialogError}
        />

        <IncomeFormDialog
          open={incomeDialogOpen}
          onOpenChange={(o) => {
            setIncomeDialogOpen(o);
            if (!o) setIncomeEditing(null);
          }}
          initialIncome={incomeEditing}
          onSubmit={handleIncomeSubmit}
          isSubmitting={createIncomeM.isPending || updateIncomeM.isPending}
          errorMessage={incomeDialogError}
        />
      </div>
    </div>
  );
}
