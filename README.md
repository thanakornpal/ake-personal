# Personal Timeline

Next.js app implementing the use-case spec: personal timeline, 9 record
categories, dashboard/summary, search & filter, expiry alerts, Google
sign-in via Firebase Auth, and file attachments via Cloudflare R2
presigned URLs.

## Why you were seeing a 404 on Vercel

A whole-site `404: NOT_FOUND` on Vercel almost always means Vercel has no
buildable Next.js project to serve — e.g. only loose files were pushed
without `package.json`/`app/` in the right place, or the build failed
silently. This folder is a complete, buildable project. Deploy this
folder as-is and the 404 should go away.

## 1. Push this folder to GitHub

```bash
cd personal-timeline
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 2. Import into Vercel

1. vercel.com → **Add New → Project** → import the GitHub repo.
2. Framework Preset should auto-detect as **Next.js** — leave it.
3. Don't deploy yet — first add environment variables (next step).

## 3. Environment variables (Vercel → Project → Settings → Environment Variables)

From `.env.example` in this folder, set real values for:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
  (from a Firebase service account JSON — Project settings → Service accounts
  → Generate new private key. Paste the `private_key` value with `\n` kept as
  literal `\n`.)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
  (use a **freshly rotated** R2 API token — never reuse one that was ever
  pasted into a chat or committed to a repo)

Never put these values in the repo itself — only in Vercel's environment
variable settings (and your local `.env.local`, which `.gitignore` already
excludes).

## 4. Enable Google sign-in in Firebase

Firebase Console → Authentication → Sign-in method → enable **Google** →
set a support email → Save. Then Authentication → Settings → Authorized
domains → add your Vercel domain (e.g. `your-project.vercel.app`).

## 5. Deploy

Back in Vercel, click **Deploy**. Once it finishes, open the deployment
URL — you should land on the Google sign-in screen instead of a 404.

## 6. Firestore rules

Deploy `firestore.rules` from this folder via the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules --project <your-firebase-project-id>
```

## Project structure

```
app/
  layout.jsx           — wraps everything in <AuthProvider>
  page.jsx              — renders the main app
  globals.css           — Tailwind directives
  api/uploads/presign/route.js  — presigned R2 upload/download/delete (UC-09)
components/
  PersonalTimelineApp.jsx  — the full UI (timeline, categories, dashboard, expiry)
context/
  AuthContext.jsx        — Firebase Auth state + Google sign-in/out
lib/
  firebase.js             — client SDK init
  firebaseAdmin.js         — server-side SDK init (token verification)
firestore.rules            — per-owner Firestore access rules
```

## Still local-only for now

`items` (the timeline records) still live in React state in
`PersonalTimelineApp.jsx` — they reset on refresh and aren't shared across
devices yet. The next step is wiring that to Firestore
(`users/{uid}/timeline`) so records persist. Ask and I'll wire that in.
# ake-personal
