import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import type { BillDTO, CreateBillDTO } from "@/types/bill";
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

export async function GET(req: NextRequest) {
  const { uid } = await requireUser(req);
  const db = adminDb();

  const snap = await db.collection("users").doc(uid).collection("bills").orderBy("dueDate", "asc").get();
  const data = snap.docs.map((d) => billDocToDTO(d.id, d.data()));

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { uid } = await requireUser(req);
  const db = adminDb();

  const body = (await req.json().catch(() => null)) as CreateBillDTO | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const amount = Number(body.amount);
  const frequency = body.frequency;
  const dueDateIso = String(body.dueDate ?? "");
  const isSubscription = Boolean(body.isSubscription);
  const paid = Boolean(body.paid);

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!Number.isFinite(amount) || amount < 0)
    return NextResponse.json({ error: "amount must be a non-negative number" }, { status: 400 });

  const dueDate = new Date(dueDateIso);
  if (Number.isNaN(dueDate.getTime()))
    return NextResponse.json({ error: "dueDate must be an ISO date string" }, { status: 400 });

  const now = Timestamp.now();

  const ref = await db
    .collection("users")
    .doc(uid)
    .collection("bills")
    .add({
      name,
      amount,
      dueDate: Timestamp.fromDate(dueDate),
      frequency,
      isSubscription,
      paid,
      createdAt: now,
      updatedAt: now,
    });

  const created = await ref.get();
  const dto = billDocToDTO(created.id, created.data() || {});

  return NextResponse.json({ data: dto }, { status: 201 });
}
