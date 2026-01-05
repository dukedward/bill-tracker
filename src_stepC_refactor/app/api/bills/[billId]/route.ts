import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import type { BillDTO, UpdateBillDTO } from "@/types/bill";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";

function billDocToDTO(id: string, data: FirebaseFirestore.DocumentData): BillDTO {
  const dueDate: Date =
    data.dueDate?.toDate?.() instanceof Date ? data.dueDate.toDate() : new Date(data.dueDate);
  const createdAt: Date | undefined =
    data.createdAt?.toDate?.() instanceof Date ? data.createdAt.toDate() : undefined;
  const updatedAt: Date | undefined =
    data.updatedAt?.toDate?.() instanceof Date ? data.updatedAt.toDate() : undefined;

  return {
    id,
    name: String(data.name ?? ""),
    amount: Number(data.amount ?? 0),
    dueDate: dueDate.toISOString(),
    frequency: data.frequency,
    isSubscription: Boolean(data.isSubscription),
    paid: Boolean(data.paid),
    createdAt: createdAt?.toISOString(),
    updatedAt: updatedAt?.toISOString(),
  };
}

export async function GET(req: NextRequest, ctx: { params: { billId: string } }) {
  const { uid } = await requireUser(req);
  const db = adminDb();

  const ref = db.collection("users").doc(uid).collection("bills").doc(ctx.params.billId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: billDocToDTO(snap.id, snap.data() || {}) });
}

export async function PATCH(req: NextRequest, ctx: { params: { billId: string } }) {
  const { uid } = await requireUser(req);
  const db = adminDb();

  const patch = (await req.json().catch(() => null)) as UpdateBillDTO | null;
  if (!patch) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };

  if (patch.name !== undefined) {
    const name = String(patch.name).trim();
    if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    updates.name = name;
  }

  if (patch.amount !== undefined) {
    const amount = Number(patch.amount);
    if (!Number.isFinite(amount) || amount < 0)
      return NextResponse.json({ error: "amount must be a non-negative number" }, { status: 400 });
    updates.amount = amount;
  }

  if (patch.dueDate !== undefined) {
    const dueDate = new Date(String(patch.dueDate));
    if (Number.isNaN(dueDate.getTime()))
      return NextResponse.json({ error: "dueDate must be an ISO date string" }, { status: 400 });
    updates.dueDate = Timestamp.fromDate(dueDate);
  }

  if (patch.frequency !== undefined) updates.frequency = patch.frequency;
  if (patch.isSubscription !== undefined) updates.isSubscription = Boolean(patch.isSubscription);
  if (patch.paid !== undefined) updates.paid = Boolean(patch.paid);

  const ref = db.collection("users").doc(uid).collection("bills").doc(ctx.params.billId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ref.update(updates);

  const updated = await ref.get();
  return NextResponse.json({ data: billDocToDTO(updated.id, updated.data() || {}) });
}

export async function DELETE(req: NextRequest, ctx: { params: { billId: string } }) {
  const { uid } = await requireUser(req);
  const db = adminDb();

  const ref = db.collection("users").doc(uid).collection("bills").doc(ctx.params.billId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ref.delete();
  return NextResponse.json({ ok: true });
}
