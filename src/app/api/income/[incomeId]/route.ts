import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import type { IncomeDTO } from "@/types/income";
import { UpdateIncomeSchema } from "@/lib/validators/income";
import { readJson, formatZodError } from "@/lib/validators/bills";

export const runtime = "nodejs";

function incomeDocToDTO(
  id: string,
  data: FirebaseFirestore.DocumentData
): IncomeDTO {
  const date: Date =
    data.date?.toDate?.() instanceof Date ? data.date.toDate() : new Date(data.date);

  const createdAt: Date | undefined =
    data.createdAt?.toDate?.() instanceof Date ? data.createdAt.toDate() : undefined;

  const updatedAt: Date | undefined =
    data.updatedAt?.toDate?.() instanceof Date ? data.updatedAt.toDate() : undefined;

  return {
    id,
    name: String(data.name ?? ""),
    amount: Number(data.amount ?? 0),
    date: date.toISOString(),
    frequency: data.frequency ?? undefined,
    source: data.source ?? "",
    notes: data.notes ?? "",
    createdAt: createdAt ? createdAt.toISOString() : undefined,
    updatedAt: updatedAt ? updatedAt.toISOString() : undefined,
  };
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ incomeId: string }> }) {
  try {
    const { uid } = await requireUser(req);
    const { incomeId } = await ctx.params;

    const body = await readJson(req);
    const parsed = UpdateIncomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(formatZodError(parsed.error), { status: 400 });
    }

    const patch = parsed.data;
    const db = adminDb();
    const ref = db.collection("users").doc(uid).collection("income").doc(incomeId);

    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };

    if (patch.name !== undefined) updates.name = patch.name.trim();
    if (patch.amount !== undefined) updates.amount = Number(patch.amount) || 0;
    if (patch.date !== undefined) updates.date = Timestamp.fromDate(new Date(patch.date));
    if (patch.frequency !== undefined) updates.frequency = patch.frequency;
    if (patch.source !== undefined) updates.source = patch.source ?? "";
    if (patch.notes !== undefined) updates.notes = patch.notes ?? "";

    await ref.update(updates);

    const updated = await ref.get();
    return NextResponse.json({ data: incomeDocToDTO(updated.id, updated.data() || {}) });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ incomeId: string }> }) {
  try {
    const { uid } = await requireUser(req);
    const { incomeId } = await ctx.params;

    const db = adminDb();
    const ref = db.collection("users").doc(uid).collection("income").doc(incomeId);

    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
