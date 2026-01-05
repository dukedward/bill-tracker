"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Bill } from "@/types/bill";
import { fmtCurrency, fmtDateShort } from "@/components/bill-tracker/uiBits";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function BillsTable(props: {
  bills: Bill[];
  onEdit: (b: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (b: Bill, nextPaid: boolean) => void;

  isEditingOrDeleting?: boolean;
  togglingId?: string | null;
  isToggling?: boolean;

  className?: string;
}) {
  const {
    bills,
    onEdit,
    onDelete,
    onTogglePaid,
    isEditingOrDeleting,
    togglingId,
    isToggling,
    className,
  } = props;

  const now = React.useMemo(() => startOfDay(new Date()), []);

  if (!bills.length) {
    return (
      <div className={cn("text-sm text-foreground", className)}>
        No bills match your filters.
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bills.map((b) => {
            const overdue = !b.paid && startOfDay(b.dueDate) < now;

            return (
              <TableRow key={b.id} className={cn(b.paid && "opacity-70")}>
                <TableCell
                  className={cn("font-medium", b.paid && "line-through")}
                >
                  {b.name}
                </TableCell>

                <TableCell className={cn(b.paid && "line-through")}>
                  {fmtCurrency(b.amount)}
                </TableCell>

                <TableCell
                  className={cn(
                    overdue && "text-red-400",
                    b.paid && "line-through"
                  )}
                >
                  {fmtDateShort(b.dueDate)}
                  {overdue ? (
                    <span className="ml-2 text-xs">(overdue)</span>
                  ) : null}
                </TableCell>

                <TableCell className={cn(b.paid && "line-through")}>
                  {b.frequency}
                </TableCell>

                <TableCell>
                  {b.isSubscription ? (
                    <Badge variant="secondary">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={Boolean(b.paid)}
                      onCheckedChange={(checked) =>
                        onTogglePaid(b, Boolean(checked))
                      }
                      disabled={
                        (isToggling && togglingId === b.id) ||
                        Boolean(isEditingOrDeleting)
                      }
                      aria-label={b.paid ? "Mark as unpaid" : "Mark as paid"}
                    />
                    <span className="text-xs text-slate-300">
                      {b.paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => onEdit(b)}
                      disabled={Boolean(isEditingOrDeleting)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      className="rounded-2xl"
                      onClick={() => onDelete(b.id)}
                      disabled={Boolean(isEditingOrDeleting)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
