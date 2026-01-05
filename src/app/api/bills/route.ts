import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/requireUser";
import type { BillDTO } from "@/types/bill";
import {
  CreateBillSchema,
  readJson,
  validationErrorResponse,
} from "@/lib/validators/bills";

export const runtime = "nodejs";

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
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireUser(req);

    const body = await readJson(req);
    const parsed = CreateBillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(validationErrorResponse(parsed), {
        status: 400,
      });
    }

    const input = parsed.data;

    const db = adminDb();
    const now = Timestamp.now();
    const dueDate = new Date(input.dueDate);

    const ref = await db
      .collection("users")
      .doc(uid)
      .collection("bills")
      .add({
        name: input.name,
        amount: input.amount,
        dueDate: Timestamp.fromDate(dueDate),
        frequency: input.frequency,
        category: input.category ?? "other",
        isSubscription: input.isSubscription,
        paid: input.paid,
        vendor: input.vendor ?? "",
        notes: input.notes ?? "",
        createdAt: now,
        updatedAt: now,
      });

    const created = await ref.get();
    const dto = billDocToDTO(created.id, created.data() || {});
    return NextResponse.json({ data: dto }, { status: 201 });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
