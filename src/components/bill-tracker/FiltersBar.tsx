"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type BillsStatusFilter = "all" | "unpaid" | "paid";
export type BillsSort =
  | "dueDateAsc"
  | "dueDateDesc"
  | "amountDesc"
  | "amountAsc"
  | "nameAsc"
  | "nameDesc";

export function FiltersBar(props: {
  search: string;
  onSearchChange: (v: string) => void;

  status: BillsStatusFilter;
  onStatusChange: (v: BillsStatusFilter) => void;

  sort: BillsSort;
  onSortChange: (v: BillsSort) => void;

  className?: string;
}) {
  const {
    search,
    onSearchChange,
    status,
    onStatusChange,
    sort,
    onSortChange,
    className,
  } = props;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="max-w-md">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search bills (name)…"
          className="rounded-2xl"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={status}
          onValueChange={(v) => onStatusChange(v as BillsStatusFilter)}
        >
          <SelectTrigger className="w-full rounded-2xl sm:w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => onSortChange(v as BillsSort)}
        >
          <SelectTrigger className="w-full rounded-2xl sm:w-55">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDateAsc">Due date (soonest)</SelectItem>
            <SelectItem value="dueDateDesc">Due date (latest)</SelectItem>
            <SelectItem value="amountDesc">Amount (high → low)</SelectItem>
            <SelectItem value="amountAsc">Amount (low → high)</SelectItem>
            <SelectItem value="nameAsc">Name (A → Z)</SelectItem>
            <SelectItem value="nameDesc">Name (Z → A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
