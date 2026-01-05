// src/app/api/bills/[billId]/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import { billToUpdateDTO, type UpdateBillDTO } from "@/types/bill";
import { Timestamp } from "firebase-admin/firestore";

type RouteContext = {
  params: Promise<{ billId: string }>;
};

function toTimestampIfDateLike(v: unknown) {
  if (!v) return undefined;

  // If client sent ISO string
  if (typeof v === "string") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return Timestamp.fromDate(d);
  }

  // If client sent Date (unlikely over JSON, but safe)
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return Timestamp.fromDate(v);
  }

  return undefined;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { uid } = await requireUser(_req);
  const { billId } = await ctx.params;

  if (!billId) {
    return NextResponse.json({ error: "Missing billId" }, { status: 400 });
  }

  const db = adminDb();
  const ref = db.collection("users").doc(uid).collection("bills").doc(billId);
  const snap = await ref.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: billToUpdateDTO(snap.id, snap.data()!) });
}

export async function PATCH(req: Request, ctx: RouteContext) {
  const { uid } = await requireUser(req);
  const { billId } = await ctx.params;

  if (!billId) {
    return NextResponse.json({ error: "Missing billId" }, { status: 400 });
  }

  const patch = (await req.json()) as UpdateBillDTO;

  // Build safe update object (only allow known fields)
  const updates: Record<string, any> = { updatedAt: Timestamp.now() };

  if (typeof patch.name === "string") updates.name = patch.name.trim();
  if (typeof patch.frequency === "string") updates.frequency = patch.frequency;
  if (typeof patch.isSubscription === "boolean") updates.isSubscription = patch.isSubscription;
  if (typeof patch.paid === "boolean") updates.paid = patch.paid;

  if (patch.amount !== undefined && patch.amount !== null) {
    const n = Number(patch.amount);
    if (!Number.isNaN(n)) updates.amount = n;
  }

  // dueDate expected as ISO string from client DTO
  const ts = toTimestampIfDateLike((patch as any).dueDate);
  if (ts) updates.dueDate = ts;

  const db = adminDb();
  const ref = db.collection("users").doc(uid).collection("bills").doc(billId);

  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ref.update(updates);

  const fresh = await ref.get();
  return NextResponse.json({ data: billToUpdateDTO(fresh.id, fresh.data()!) });
}

export async function DELETE(req: Request, ctx: RouteContext) {
  const { uid } = await requireUser(req);
  const { billId } = await ctx.params;

  if (!billId) {
    return NextResponse.json({ error: "Missing billId" }, { status: 400 });
  }

  const db = adminDb();
  const ref = db.collection("users").doc(uid).collection("bills").doc(billId);

  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ref.delete();

  return NextResponse.json({ ok: true });
}