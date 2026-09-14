// lib/firebaseAdmin.js
//
// Server-side only. Uses a Firebase service account (never exposed to
// the browser) to verify ID tokens sent by the client.

import { initializeApp, getApps, cert } from "firebase-admin/app";

export function initFirebaseAdmin() {
  if (getApps().length) return;
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}
