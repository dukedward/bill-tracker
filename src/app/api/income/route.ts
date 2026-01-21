import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import type { IncomeDTO } from "@/types/income";
import { CreateIncomeSchema } from "@/lib/validators/income";
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

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireUser(req);
    const db = adminDb();

    const snap = await db
      .collection("users")
      .doc(uid)
      .collection("income")
      .orderBy("date", "desc")
      .get();

    const data = snap.docs.map((d) => incomeDocToDTO(d.id, d.data()));
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireUser(req);
    const body = await readJson(req);
    const parsed = CreateIncomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(formatZodError(parsed.error), { status: 400 });
    }

    const input = parsed.data;
    const db = adminDb();
    const now = Timestamp.now();

    const ref = db.collection("users").doc(uid).collection("income").doc();
    const date = new Date(input.date);

    const payload: Record<string, unknown> = {
      name: input.name.trim(),
      amount: Number(input.amount) || 0,
      date: Timestamp.fromDate(date),
      source: input.source ?? "",
      notes: input.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };
    if (input.frequency) payload.frequency = input.frequency;

    await ref.set(payload);

    const created = await ref.get();
    return NextResponse.json({ data: incomeDocToDTO(created.id, created.data() || {}) }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
