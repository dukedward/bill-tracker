import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Bill } from "@/types/bill";

export const addBill = async (
  userId: string,
  bill: Omit<Bill, "id">
) => {
  await addDoc(collection(db, "users", userId, "bills"), {
    ...bill,
    dueDate: Timestamp.fromDate(bill.dueDate),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getBills = async (userId: string) => {
  const snapshot = await getDocs(
    collection(db, "users", userId, "bills")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: doc.data().dueDate.toDate(),
  })) as Bill[];
};

export const updateBill = async (
  userId: string,
  billId: string,
  data: Partial<Bill>
) => {
  await updateDoc(
    doc(db, "users", userId, "bills", billId),
    {
      ...data,
      updatedAt: Timestamp.now(),
    }
  );
};

export const deleteBill = async (
  userId: string,
  billId: string
) => {
  await deleteDoc(
    doc(db, "users", userId, "bills", billId)
  );
};

export async function markBillPaid(
  userId: string,
  billId: string,
  updates: Partial<Bill>
) {
  const ref = doc(db, "users", userId, "bills", billId);
  await updateDoc(ref, updates);
}

export async function getBillById(
  userId: string,
  billId: string
): Promise<Bill | null> {
  const ref = doc(db, "users", userId, "bills", billId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();

  return {
    id: snap.id,
    ...data,
    dueDate: data.dueDate.toDate(),
  } as Bill;
}