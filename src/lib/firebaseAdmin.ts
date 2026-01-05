// src/lib/firebaseAdmin.ts
import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function mustGet(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const projectId = mustGet("FIREBASE_PROJECT_ID");
  const clientEmail = mustGet("FIREBASE_CLIENT_EMAIL");
  const privateKey = mustGet("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminAuth() {
  getAdminApp();
  return getAuth();
}
