"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";

import { useAuth } from "@/lib/useAuth";
import { useBills, useCreateBill, useUpdateBill, useDeleteBill, useToggleBillPaid } from "@/components/bill-tracker/hooks";
import type { Bill } from "@/types/bill";
import { billToCreateDTO, billToUpdateDTO } from "@/types/bill";

import { BillFormDialog } from "@/components/bill-tracker/BillFormDialog";
import { SummaryCards } from "@/components/bill-tracker/SummaryCards";
import { FiltersBar, type BillsSort, type BillsStatusFilter } from "@/components/bill-tracker/FiltersBar";
import { BillsTable } from "@/components/bill-tracker/BillsTable";

function applyFilters(bills: Bill[], search: string, status: BillsStatusFilter): Bill[] {
  const s = search.trim().toLowerCase();

  return bills.filter((b) => {
    if (status === "paid" && !b.paid) return false;
    if (status === "unpaid" && b.paid) return false;

    if (!s) return true;
    return b.name.toLowerCase().includes(s);
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
  const { user, isLoading: authLoading } = useAuth();

  const canUseApp = Boolean(user && !authLoading);

  const billsQ = useBills(canUseApp);
  const createM = useCreateBill();
  const updateM = useUpdateBill();
  const delM = useDeleteBill();
  const togglePaidM = useToggleBillPaid();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Bill | null>(null);
  const [dialogError, setDialogError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<BillsStatusFilter>("all");
  const [sort, setSort] = React.useState<BillsSort>("dueDateAsc");

  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const bills = billsQ.data ?? [];

  const filteredSortedBills = React.useMemo(() => {
    const filtered = applyFilters(bills, search, status);
    return applySort(filtered, sort);
  }, [bills, search, status, sort]);

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

  async function handleSubmit(values: {
    name: string;
    amount: number;
    dueDate: Date;
    frequency: Bill["frequency"];
    isSubscription: boolean;
    paid: boolean;
  }) {
    if (!canUseApp) return;

    setDialogError(null);

    try {
      if (editing?.id) {
        await updateM.mutateAsync({ id: editing.id, patch: billToUpdateDTO(values) });
      } else {
        await createM.mutateAsync(billToCreateDTO(values));
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (e: any) {
      setDialogError(e?.message || "Something went wrong.");
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
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Bill Tracker</h1>
            <p className="mt-1 text-sm text-slate-300">Track due dates, amounts, and payment status.</p>
          </div>

          <Button className="rounded-2xl" onClick={openCreate} disabled={!canUseApp}>
            <Plus className="mr-2 h-4 w-4" />
            Add bill
          </Button>
        </div>

        <Separator className="my-6" />

        {!canUseApp ? (
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">Sign in to continue</CardTitle>
              <CardDescription>
                Use the Login button in the top bar. Your bills are stored securely per account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-300">
                Once you sign in, this page will load your bills from <code>/api/bills</code>.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <SummaryCards bills={bills} />

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl">Your bills</CardTitle>
                <CardDescription>Search, filter, and manage bills.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <FiltersBar
                  search={search}
                  onSearchChange={setSearch}
                  status={status}
                  onStatusChange={setStatus}
                  sort={sort}
                  onSortChange={setSort}
                />

                {billsQ.isLoading ? (
                  <div className="text-sm text-slate-300">Loading bills…</div>
                ) : billsQ.isError ? (
                  <div className="text-sm text-red-400">Failed to load bills.</div>
                ) : (
                  <BillsTable
                    bills={filteredSortedBills}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onTogglePaid={handleTogglePaid}
                    isEditingOrDeleting={createM.isPending || updateM.isPending || delM.isPending}
                    isToggling={togglePaidM.isPending}
                    togglingId={togglingId}
                  />
                )}
              </CardContent>
            </Card>
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
      </div>
    </div>
  );
}
