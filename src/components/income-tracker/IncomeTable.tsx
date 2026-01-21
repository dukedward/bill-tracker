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
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Income } from "@/types/income";
import { fmtCurrency, fmtDateShort } from "@/components/bill-tracker/uiBits";

export function IncomeTable(props: {
  income: Income[];
  onEdit: (i: Income) => void;
  onDelete: (id: string) => void;
  isEditingOrDeleting?: boolean;
  className?: string;
}) {
  const { income, onEdit, onDelete, isEditingOrDeleting, className } = props;

  if (!income.length) {
    return (
      <div className={cn("text-sm text-foreground", className)}>
        No income entries match your filters.
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
            <TableHead>Date</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {income.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-medium">{i.name}</TableCell>
              <TableCell>{fmtCurrency(i.amount)}</TableCell>
              <TableCell>{fmtDateShort(i.date)}</TableCell>
              <TableCell className="max-w-60 truncate" title={i.source || ""}>
                {i.source ? i.source : <span className="text-slate-500">—</span>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => onEdit(i)}
                    disabled={Boolean(isEditingOrDeleting)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    className="rounded-2xl"
                    onClick={() => onDelete(i.id)}
                    disabled={Boolean(isEditingOrDeleting)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
