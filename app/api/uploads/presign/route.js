// app/api/uploads/presign/route.js
//
// Implements UC-09 (Upload), UC-09.1 (Download), UC-09.2 (Delete).
// Call as POST /api/uploads/presign?action=upload|download|delete
// with an Authorization: Bearer <Firebase ID token> header.

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin } from "../../../../lib/firebaseAdmin";

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function requireUser(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new Error("missing_token");

  initFirebaseAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  return decoded.uid;
}

function objectKeyFor(uid, attachmentId, filename) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `users/${uid}/attachments/${attachmentId}/${safeName}`;
}

export async function POST(request) {
  let uid;
  try {
    uid = await requireUser(request);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const body = await request.json().catch(() => ({}));

  if (action === "upload") {
    const { attachmentId, filename, contentType, size } = body;
    if (!attachmentId || !filename || !contentType || !size) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
    }
    if (size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "file_too_large" }, { status: 413 });
    }

    const objectKey = objectKeyFor(uid, attachmentId, filename);
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
    return NextResponse.json({ uploadUrl, objectKey });
  }

  if (action === "download") {
    const { objectKey } = body;
    if (!objectKey || !objectKey.startsWith(`users/${uid}/`)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const command = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: objectKey });
    const downloadUrl = await getSignedUrl(r2, command, { expiresIn: 120 });
    return NextResponse.json({ downloadUrl });
  }

  if (action === "delete") {
    const { objectKey } = body;
    if (!objectKey || !objectKey.startsWith(`users/${uid}/`)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: objectKey }));
    return NextResponse.json({ deleted: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
