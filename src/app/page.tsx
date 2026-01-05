"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { useAuth } from "@/lib/useAuth";
import {
  useBills,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
  useToggleBillPaid,
} from "@/components/bill-tracker/hooks";
import type { Bill } from "@/types/bill";
import { billToCreateDTO, billToUpdateDTO } from "@/types/bill";
import { SubBadge } from "@/components/bill-tracker/uiBits";
import { BillFormDialog } from "@/components/bill-tracker/BillFormDialog";

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Page() {
  const { user, loading: authLoading } = useAuth();

  const billsQ = useBills();
  const createM = useCreateBill();
  const updateM = useUpdateBill();
  const delM = useDeleteBill();
  const togglePaidM = useToggleBillPaid();
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Bill | null>(null);

  const canUseApp = !authLoading && !!user;

  const bills = billsQ.data ?? [];
  const filteredBills = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bills;
    return bills.filter((b) => b.name.toLowerCase().includes(q));
  }, [search, bills]);

  const dialogError =
    (createM.isError ? (createM.error as Error)?.message : null) ||
    (updateM.isError ? (updateM.error as Error)?.message : null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(b: Bill) {
    setEditing(b);
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

    if (editing) {
      await updateM.mutateAsync({
        id: editing.id,
        patch: billToUpdateDTO(values),
      });
    } else {
      await createM.mutateAsync(billToCreateDTO(values));
    }

    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background pt-4">
      <div className="mx-auto max-w-6xl px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Bill Tracker
            </h1>
            <p className="text-forground">
              Track bills, due dates, subscriptions, and payment status.
            </p>
          </div>

          <div className="flex items-center gap-2 text-foreground">
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

        <Separator className="my-6"></Separator>

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
          <Card className="rounded-3xl text-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Your bills</CardTitle>
              <CardDescription>
                Search, add, edit, and delete bills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="max-w-md">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bills..."
                    className="rounded-2xl"
                  />
                </div>

                <div className="text-sm">
                  {billsQ.isFetching
                    ? "Refreshing..."
                    : `${filteredBills.length} bills`}
                </div>
              </div>

              {billsQ.isError ? (
                <div className="text-sm text-destuctive">
                  {(billsQ.error as Error)?.message ?? "Failed to load bills"}
                </div>
              ) : null}

              <div className="overflow-hidden rounded-3xl border border-input">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[28%]">Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredBills.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell>{fmtMoney(b.amount)}</TableCell>
                        <TableCell>{fmtDate(b.dueDate)}</TableCell>
                        <TableCell className="capitalize">
                          {b.frequency}
                        </TableCell>
                        <TableCell>
                          <SubBadge sub={b.isSubscription} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Switch
                              checked={b.paid}
                              onCheckedChange={(checked) => {
                                setTogglingId(b.id);
                                togglePaidM.mutate(
                                  { id: b.id, paid: checked },
                                  { onSettled: () => setTogglingId(null) }
                                );
                              }}
                              disabled={
                                togglePaidM.isPending && togglingId === b.id
                              }
                              aria-label={
                                b.paid ? "Mark as unpaid" : "Mark as paid"
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() => openEdit(b)}
                              disabled={updateM.isPending || delM.isPending}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              className="rounded-2xl"
                              onClick={() => delM.mutate(b.id)}
                              disabled={delM.isPending || updateM.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredBills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center">
                          No bills yet. Click{" "}
                          <span className="font-semibold"> Add bill</span> to
                          create one.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>

              {delM.isError ? (
                <div className="text-sm text-destructive">
                  {(delM.error as Error)?.message ?? "Failed to delete bill"}
                </div>
              ) : null}
            </CardContent>
          </Card>
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
