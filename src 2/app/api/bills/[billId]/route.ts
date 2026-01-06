import { NextResponse, NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import type { BillDTO, UpdateBillDTO } from "@/types/bill";
import {
  UpdateBillSchema,
  readJson,
  formatZodError,
} from "@/lib/validators/bills";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ billId: string }> };

function billDocToDTO(
  id: string,
  data: FirebaseFirestore.DocumentData
): BillDTO {
  const dueDate: Date =
    data.dueDate?.toDate?.() instanceof Date
      ? data.dueDate.toDate()
      : new Date(data.dueDate);

  const createdAt: Date | undefined =
    data.createdAt?.toDate?.() instanceof Date
      ? data.createdAt.toDate()
      : undefined;

  const updatedAt: Date | undefined =
    data.updatedAt?.toDate?.() instanceof Date
      ? data.updatedAt.toDate()
      : undefined;

  const category = (data.category ?? "other") as BillDTO["category"];

  return {
    id,
    name: String(data.name ?? ""),
    amount: Number(data.amount ?? 0),
    dueDate: dueDate.toISOString(),
    frequency: data.frequency,
    category,
    isSubscription: Boolean(data.isSubscription),
    paid: Boolean(data.paid),
    vendor: typeof data.vendor === "string" ? data.vendor : "",
    notes: typeof data.notes === "string" ? data.notes : "",
    createdAt: createdAt?.toISOString(),
    updatedAt: updatedAt?.toISOString(),
  };
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const { uid } = await requireUser(req);
    const { billId } = await ctx.params;

    if (!billId)
      return NextResponse.json({ error: "Missing billId" }, { status: 400 });

    const db = adminDb();
    const ref = db.collection("users").doc(uid).collection("bills").doc(billId);

    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      data: billDocToDTO(snap.id, snap.data() || {}),
    });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { uid } = await requireUser(req);
    const { billId } = await ctx.params;

    if (!billId)
      return NextResponse.json({ error: "Missing billId" }, { status: 400 });

    const body = await readJson(req);
    const parsed = UpdateBillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(formatZodError(parsed.error), { status: 400 });
    }

    const patch = parsed.data;

    const updates: Record<string, any> = { updatedAt: Timestamp.now() };

    if (patch.name !== undefined) updates.name = patch.name.trim();
    if (patch.amount !== undefined) updates.amount = patch.amount;
    if (patch.dueDate !== undefined)
      updates.dueDate = Timestamp.fromDate(new Date(patch.dueDate));
    if (patch.frequency !== undefined) updates.frequency = patch.frequency;
    if (patch.category !== undefined) updates.category = patch.category;
    if (patch.isSubscription !== undefined)
      updates.isSubscription = patch.isSubscription;
    if (patch.paid !== undefined) updates.paid = patch.paid;
    if (patch.vendor !== undefined) updates.vendor = patch.vendor;
    if (patch.notes !== undefined) updates.notes = patch.notes ?? "";

    const db = adminDb();
    const ref = db.collection("users").doc(uid).collection("bills").doc(billId);

    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await ref.update(updates);

    const updated = await ref.get();
    return NextResponse.json({
      data: billDocToDTO(updated.id, updated.data() || {}),
    });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const { uid } = await requireUser(req);
    const { billId } = await ctx.params;

    if (!billId)
      return NextResponse.json({ error: "Missing billId" }, { status: 400 });

    const db = adminDb();
    const ref = db.collection("users").doc(uid).collection("bills").doc(billId);

    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
