// lib/firebase.js
//
// Client-side Firebase init. Only uses NEXT_PUBLIC_* values — these are
// safe to ship to the browser (they identify the project, they don't
// authorize anything by themselves; real access control lives in
// firestore.rules and your API routes' ID-token checks).

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google as a Firebase Auth provider (UC-01).
// Optionally restrict sign-in to one Workspace domain by setting:
// googleProvider.setCustomParameters({ hd: "yourcompany.com" });
// then re-check `user.email.endsWith("@yourcompany.com")` server-side too,
// since the hd hint can be spoofed on the client.
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
