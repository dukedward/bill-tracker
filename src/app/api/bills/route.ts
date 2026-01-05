import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import type { BillDTO } from "@/types/bill";
import { CreateBillSchema, zodErrorToResponse } from "@/lib/validators/bills";

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
  try {
    const { uid } = await requireUser(req);
    const db = adminDb();

    const snap = await db
      .collection("users")
      .doc(uid)
      .collection("bills")
      .orderBy("dueDate", "asc")
      .get();

    const data = snap.docs.map((d) => billDocToDTO(d.id, d.data()));
    return NextResponse.json({ data });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireUser(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = CreateBillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(zodErrorToResponse(parsed.error), { status: 400 });
    }

    const { name, amount, dueDate: dueDateStr, frequency, isSubscription, paid } = parsed.data;

    const dueDate = new Date(dueDateStr);
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
    }

    const db = adminDb();
    const now = Timestamp.now();

    const ref = await db.collection("users").doc(uid).collection("bills").add({
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
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
