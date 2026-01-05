import { NextResponse, NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import type { BillDTO, UpdateBillDTO } from "@/types/bill";
import { UpdateBillSchema, zodErrorToResponse } from "@/lib/validators/bills";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ billId: string }> };

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

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const { uid } = await requireUser(req);
    const { billId } = await ctx.params;

    if (!billId) return NextResponse.json({ error: "Missing billId" }, { status: 400 });

    const db = adminDb();
    const ref = db.collection("users").doc(uid).collection("bills").doc(billId);

    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: billDocToDTO(snap.id, snap.data() || {}) });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { uid } = await requireUser(req);
    const { billId } = await ctx.params;

    if (!billId) return NextResponse.json({ error: "Missing billId" }, { status: 400 });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = UpdateBillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(zodErrorToResponse(parsed.error), { status: 400 });
    }

    const patch = parsed.data as UpdateBillDTO;
    const updates: Record<string, any> = { updatedAt: Timestamp.now() };

    if (patch.name !== undefined) updates.name = String(patch.name).trim();
    if (patch.frequency !== undefined) updates.frequency = patch.frequency;
    if (patch.isSubscription !== undefined) updates.isSubscription = Boolean(patch.isSubscription);
    if (patch.paid !== undefined) updates.paid = Boolean(patch.paid);

    if (patch.amount !== undefined) {
      const n = Number(patch.amount);
      if (Number.isNaN(n) || !Number.isFinite(n)) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }
      updates.amount = n;
    }

    if ((patch as any).dueDate !== undefined) {
      const d = new Date((patch as any).dueDate);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
      }
      updates.dueDate = Timestamp.fromDate(d);
    }

    const db = adminDb();
    const ref = db.collection("users").doc(uid).collection("bills").doc(billId);

    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await ref.update(updates);

    const fresh = await ref.get();
    return NextResponse.json({ data: billDocToDTO(fresh.id, fresh.data() || {}) });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const { uid } = await requireUser(req);
    const { billId } = await ctx.params;

    if (!billId) return NextResponse.json({ error: "Missing billId" }, { status: 400 });

    const db = adminDb();
    const ref = db.collection("users").doc(uid).collection("bills").doc(billId);

    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
