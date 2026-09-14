"use client";

import React, { useState, useMemo } from "react";
import {
  Dumbbell, BookOpen, Briefcase, Home as HomeIcon, ShieldCheck, Laptop,
  Wrench, FileText, Award, Search, Plus, X, LogOut, LogIn, AlertTriangle,
  LayoutDashboard, Clock, Paperclip, ChevronRight, ChevronLeft, Trash2,
  Pencil, Download, Filter, Calendar
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ---------------------------------------------------------------
   Design tokens
   Paper-ledger / archive aesthetic: this is a personal record system,
   so the visual language borrows from card catalogues and index cards
   rather than a generic SaaS dashboard.
----------------------------------------------------------------*/
const COLORS = {
  paper: "#ECE6D8",
  panel: "#F8F5EC",
  panelDeep: "#F3EEE1",
  ink: "#2A2621",
  inkSoft: "#6B6459",
  hairline: "#D9D0BC",
  brand: "#33506E",
  brandDeep: "#22384E",
  danger: "#A3372B",
  warn: "#B0793A",
};

const CATEGORIES = [
  { key: "workout", label: "Workout", icon: Dumbbell, color: "#B14B3F" },
  { key: "study", label: "Study", icon: BookOpen, color: "#33607E" },
  { key: "work", label: "Work", icon: Briefcase, color: "#6C5B8F" },
  { key: "home", label: "Home", icon: HomeIcon, color: "#7C8C4E" },
  { key: "insurance", label: "Insurance", icon: ShieldCheck, color: "#A9812F" },
  { key: "itproduct", label: "IT Product", icon: Laptop, color: "#43746F" },
  { key: "warranty", label: "Warranty", icon: Wrench, color: "#9C6066" },
  { key: "document", label: "Important Document", icon: FileText, color: "#59463C" },
  { key: "certificate", label: "Certificate", icon: Award, color: "#BD8635" },
];
const catByKey = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

const TODAY = new Date("2026-09-14");

const FIELD_DEFS = {
  workout: [
    { key: "workoutType", label: "ประเภทการออกกำลังกาย", type: "text" },
    { key: "duration", label: "ระยะเวลา (นาที)", type: "number" },
    { key: "distance", label: "ระยะทาง (กม.)", type: "number" },
    { key: "sets", label: "จำนวนเซต", type: "number" },
    { key: "reps", label: "จำนวนครั้ง", type: "number" },
    { key: "weight", label: "น้ำหนัก (กก.)", type: "number" },
    { key: "calories", label: "แคลอรี", type: "number" },
    { key: "feeling", label: "ความรู้สึกหลังออกกำลังกาย", type: "text" },
  ],
  study: [
    { key: "subject", label: "วิชา", type: "text" },
    { key: "source", label: "แหล่งเรียนรู้ (URL)", type: "text" },
    { key: "studyTime", label: "เวลาเรียน (นาที)", type: "number" },
    { key: "progress", label: "ความคืบหน้า (%)", type: "number" },
    { key: "score", label: "คะแนน/ผลลัพธ์", type: "text" },
  ],
  work: [
    { key: "project", label: "โครงการ", type: "text" },
    { key: "workType", label: "ประเภทงาน", type: "text" },
    { key: "workStatus", label: "สถานะ", type: "select", options: ["Not Started", "In Progress", "Done", "Blocked"] },
    { key: "stakeholders", label: "ผู้เกี่ยวข้อง", type: "text" },
    { key: "dueDate", label: "กำหนดส่ง", type: "date" },
    { key: "timeSpent", label: "เวลาที่ใช้ (ชม.)", type: "number" },
  ],
  home: [
    { key: "taskType", label: "ประเภทงาน", type: "text" },
    { key: "place", label: "สถานที่", type: "text" },
    { key: "responsible", label: "ผู้รับผิดชอบ / ร้านค้า", type: "text" },
    { key: "homeStatus", label: "สถานะ", type: "select", options: ["นัดหมายแล้ว", "กำลังดำเนินการ", "เสร็จแล้ว"] },
    { key: "appointmentDate", label: "วันที่นัดหมาย", type: "date" },
  ],
  insurance: [
    { key: "company", label: "บริษัทประกัน", type: "text" },
    { key: "policyType", label: "ประเภทประกัน", type: "text" },
    { key: "policyNo", label: "เลขกรมธรรม์", type: "text" },
    { key: "insured", label: "ผู้เอาประกัน", type: "text" },
    { key: "sumInsured", label: "ทุนประกัน", type: "number" },
    { key: "premium", label: "เบี้ยประกัน", type: "number" },
    { key: "startDate", label: "วันเริ่มต้น", type: "date" },
    { key: "expiresAt", label: "วันหมดอายุ", type: "date" },
    { key: "paymentDueDate", label: "วันครบกำหนดชำระ", type: "date" },
  ],
  itproduct: [
    { key: "productName", label: "ชื่อสินค้า", type: "text" },
    { key: "brand", label: "ยี่ห้อ", type: "text" },
    { key: "model", label: "รุ่น", type: "text" },
    { key: "serial", label: "Serial Number", type: "text" },
    { key: "purchaseDate", label: "วันที่ซื้อ", type: "date" },
    { key: "price", label: "ราคาซื้อ", type: "number" },
    { key: "store", label: "ร้านค้า", type: "text" },
    { key: "storageLocation", label: "สถานที่เก็บ", type: "text" },
    { key: "expiresAt", label: "วันหมดประกัน", type: "date" },
  ],
  warranty: [
    { key: "product", label: "สินค้า", type: "text" },
    { key: "provider", label: "ผู้ให้บริการ", type: "text" },
    { key: "warrantyNo", label: "เลขประกัน", type: "text" },
    { key: "startDate", label: "วันเริ่มประกัน", type: "date" },
    { key: "expiresAt", label: "วันหมดประกัน", type: "date" },
    { key: "serviceCenter", label: "ศูนย์บริการ", type: "text" },
    { key: "caseNo", label: "เลขที่เคส", type: "text" },
    { key: "claimStatus", label: "สถานะการเคลม", type: "text" },
  ],
  document: [
    { key: "docType", label: "ประเภทเอกสาร", type: "text" },
    { key: "docNo", label: "เลขที่เอกสาร", type: "text" },
    { key: "issuer", label: "หน่วยงานผู้ออก", type: "text" },
    { key: "issueDate", label: "วันที่ออก", type: "date" },
    { key: "expiresAt", label: "วันหมดอายุ", type: "date" },
    { key: "originalLocation", label: "สถานที่เก็บต้นฉบับ", type: "text" },
    { key: "confidentiality", label: "ระดับความลับ", type: "select", options: ["ต่ำ", "กลาง", "สูง"] },
  ],
  certificate: [
    { key: "certName", label: "ชื่อ Certificate", type: "text" },
    { key: "issuer", label: "หน่วยงานผู้ออก", type: "text" },
    { key: "certNo", label: "หมายเลข Certificate", type: "text" },
    { key: "issueDate", label: "วันที่ได้รับ", type: "date" },
    { key: "expiresAt", label: "วันหมดอายุ (เว้นว่างถ้าไม่มี)", type: "date" },
    { key: "verifyUrl", label: "URL ตรวจสอบ", type: "text" },
    { key: "skills", label: "ทักษะที่เกี่ยวข้อง", type: "text" },
  ],
};

let idCounter = 100;
const nextId = () => `item-${idCounter++}`;

const seedItems = [
  { id: nextId(), category: "workout", title: "เวทเทรนนิง Upper Body", description: "Bench Press, Shoulder Press, Lat Pulldown", occurredAt: "2026-09-14", amount: null, tags: ["gym"], attachments: [], detail: { workoutType: "เวทเทรนนิง", duration: 60, calories: 420, feeling: "สดชื่น" } },
  { id: nextId(), category: "study", title: "OAuth 2.0 Authorization Code Flow", description: "อ่านสเปกและลองทำ demo", occurredAt: "2026-09-13", amount: null, tags: ["security", "api"], attachments: ["oauth-notes.pdf"], detail: { subject: "API Security", studyTime: 90, progress: 80, source: "https://oauth.net/2/" } },
  { id: nextId(), category: "work", title: "ออกแบบ API สำหรับระบบเอกสาร", description: "ออกแบบ endpoint สำหรับ presigned URL", occurredAt: "2026-09-12", amount: null, tags: ["api"], attachments: ["api-spec.docx"], detail: { project: "Personal Information System", workType: "Design", workStatus: "In Progress", dueDate: "2026-09-20" } },
  { id: nextId(), category: "home", title: "เปลี่ยนหลอดไฟห้องทำงาน", description: "เปลี่ยนหลอด LED ห้องทำงาน", occurredAt: "2026-09-10", amount: 350, tags: [], attachments: ["receipt.jpg"], detail: { taskType: "ซ่อมแซม", place: "ห้องทำงาน", homeStatus: "เสร็จแล้ว" } },
  { id: nextId(), category: "insurance", title: "ประกันสุขภาพรายปี", description: "กรมธรรม์ประกันสุขภาพ", occurredAt: "2026-01-14", amount: 18500, tags: ["health"], attachments: ["policy.pdf"], detail: { company: "บริษัทประกันตัวอย่าง", policyType: "ประกันสุขภาพ", policyNo: "POL-2026-001", expiresAt: "2027-09-14", paymentDueDate: "2026-10-01" } },
  { id: nextId(), category: "itproduct", title: "USB-C Hub", description: "ฮับต่อพ่วงสำหรับโน้ตบุ๊ก", occurredAt: "2026-09-14", amount: 1290, tags: [], attachments: ["receipt-usbc.jpg"], detail: { productName: "USB-C Hub", brand: "Example", model: "USBH-8P", purchaseDate: "2026-09-14", price: 1290, expiresAt: "2027-09-14" } },
  { id: nextId(), category: "warranty", title: "MacBook Air", description: "ส่งเคลมจอภาพ", occurredAt: "2026-08-20", amount: null, tags: [], attachments: ["service-form.pdf"], detail: { product: "MacBook Air", serviceCenter: "Apple Authorized Service Provider", claimStatus: "รออะไหล่", expiresAt: "2026-09-20" } },
  { id: nextId(), category: "document", title: "สัญญาเช่าที่พัก", description: "สัญญาเช่าคอนโด", occurredAt: "2026-01-01", amount: null, tags: ["contract"], attachments: ["lease.pdf"], detail: { docType: "สัญญา", issueDate: "2026-01-01", expiresAt: "2026-09-19", confidentiality: "สูง" } },
  { id: nextId(), category: "certificate", title: "Cloud Fundamentals", description: "หลักสูตรพื้นฐาน Cloud", occurredAt: "2026-09-14", amount: null, tags: ["cloud"], attachments: ["cert.pdf"], detail: { issuer: "Example Academy", issueDate: "2026-09-14", expiresAt: "", verifyUrl: "https://example.com/verify/123" } },
  { id: nextId(), category: "insurance", title: "ประกันรถยนต์", description: "ประกันชั้น 1", occurredAt: "2025-10-01", amount: 12000, tags: ["car"], attachments: [], detail: { company: "บริษัทประกันรถ", policyType: "ประกันรถยนต์ชั้น 1", policyNo: "POL-2025-777", expiresAt: "2026-10-01", paymentDueDate: "2026-09-25" } },
];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Math.ceil((d - TODAY) / (1000 * 60 * 60 * 24));
}

function expiryLevel(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return null;
  if (d < 0) return { level: "expired", label: "หมดอายุแล้ว", color: COLORS.danger };
  if (d <= 7) return { level: "critical", label: `เหลือ ${d} วัน`, color: COLORS.danger };
  if (d <= 30) return { level: "warning", label: `เหลือ ${d} วัน`, color: COLORS.warn };
  return { level: "normal", label: `เหลือ ${d} วัน`, color: "#6E7B5C" };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatMoney(n) {
  if (n === null || n === undefined || n === "") return null;
  return Number(n).toLocaleString("th-TH") + " บาท";
}

/* ---------------------------------------------------------------
   Login screen — triggers the Google → Firebase Auth flow described
   in UC-01 via useAuth()'s signInWithGoogle (see context/AuthContext.jsx
   and lib/firebase.js). See SECURITY.md for the full auth/authorization
   architecture.
----------------------------------------------------------------*/
function LoginScreen({ onLogin, error }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      await onLogin();
    } catch {
      // error state is surfaced via the `error` prop from useAuth
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ background: COLORS.paper, minHeight: "100%" }} className="flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm mb-4" style={{ background: COLORS.brand }}>
            <Clock size={22} color="#F8F5EC" />
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", color: COLORS.ink }} className="text-2xl mb-1">Ledger</h1>
          <p style={{ color: COLORS.inkSoft }} className="text-sm">บันทึกชีวิต เอกสาร และวันสำคัญของคุณในที่เดียว</p>
        </div>
        <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.hairline}` }} className="rounded-sm p-6">
          <button
            onClick={handleClick}
            disabled={loading}
            style={{ background: COLORS.brand }}
            className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <LogIn size={16} />
            {loading ? "กำลังเชื่อมต่อ Google..." : "Sign in with Google"}
          </button>
          {error && (
            <p style={{ color: COLORS.danger }} className="text-xs mt-3">
              เข้าสู่ระบบไม่สำเร็จ ({error}) กรุณาลองใหม่อีกครั้ง
            </p>
          )}
          <p style={{ color: COLORS.inkSoft }} className="text-xs mt-4 leading-relaxed">
            ระบบยืนยันตัวตนผ่าน Google และ Firebase Authentication ตาม UC-01
          </p>
        </div>
      </div>
    </div>
  );
}

function ExpiryPill({ dateStr }) {
  const info = expiryLevel(dateStr);
  if (!info) return null;
  return (
    <span
      style={{ color: info.color, borderColor: info.color }}
      className="text-[11px] border rounded-full px-2 py-0.5 font-mono whitespace-nowrap"
    >
      {info.label}
    </span>
  );
}

function CategoryTag({ catKey }) {
  const cat = catByKey[catKey];
  const Icon = cat.icon;
  return (
    <span
      style={{ background: cat.color + "1a", color: cat.color, border: `1px solid ${cat.color}55` }}
      className="inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 font-medium"
    >
      <Icon size={11} /> {cat.label}
    </span>
  );
}

/* ---------------------------------------------------------------
   Item card — one "index card" per timeline record
----------------------------------------------------------------*/
function ItemCard({ item, onEdit, onDelete }) {
  const cat = catByKey[item.category];
  const expiresAt = item.detail?.expiresAt;
  return (
    <div
      style={{ background: COLORS.panel, borderLeft: `4px solid ${cat.color}`, border: `1px solid ${COLORS.hairline}`, borderLeftWidth: 4 }}
      className="rounded-sm p-4 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CategoryTag catKey={item.category} />
            {expiresAt && <ExpiryPill dateStr={expiresAt} />}
          </div>
          <h3 style={{ color: COLORS.ink, fontFamily: "Georgia, serif" }} className="text-[15px] leading-snug truncate">
            {item.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-sm hover:bg-black/5" title="แก้ไข">
            <Pencil size={14} color={COLORS.inkSoft} />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-sm hover:bg-black/5" title="ลบ">
            <Trash2 size={14} color={COLORS.danger} />
          </button>
        </div>
      </div>
      {item.description && (
        <p style={{ color: COLORS.inkSoft }} className="text-[13px] leading-relaxed">{item.description}</p>
      )}
      <div style={{ color: COLORS.inkSoft }} className="flex items-center gap-3 text-[12px] font-mono flex-wrap">
        <span className="inline-flex items-center gap-1"><Calendar size={12} />{formatDate(item.occurredAt)}</span>
        {item.amount ? <span>{formatMoney(item.amount)}</span> : null}
        {item.attachments?.length > 0 && (
          <span className="inline-flex items-center gap-1"><Paperclip size={12} />{item.attachments.length} ไฟล์</span>
        )}
      </div>
      {item.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {item.tags.map((t) => (
            <span key={t} style={{ color: COLORS.inkSoft, background: COLORS.panelDeep }} className="text-[10px] px-1.5 py-0.5 rounded-sm">#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Add / Edit form — UC-03 (add), UC-06 (edit), category-specific
   fields per UC-10..UC-18
----------------------------------------------------------------*/
function ItemForm({ initial, onSave, onClose }) {
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0].key);
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [occurredAt, setOccurredAt] = useState(initial?.occurredAt || TODAY.toISOString().slice(0, 10));
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [tagsStr, setTagsStr] = useState((initial?.tags || []).join(", "));
  const [detail, setDetail] = useState(initial?.detail || {});
  const [fileNames, setFileNames] = useState(initial?.attachments || []);

  const fields = FIELD_DEFS[category] || [];

  const handleFieldChange = (key, val) => setDetail((d) => ({ ...d, [key]: val }));

  const handleFilePick = (e) => {
    // Simulated attach: in production this triggers UC-09 — the API
    // issues a presigned R2 PUT URL and the browser uploads directly.
    const names = Array.from(e.target.files).map((f) => f.name);
    setFileNames((prev) => [...prev, ...names]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      id: initial?.id || nextId(),
      category,
      title: title.trim(),
      description,
      occurredAt,
      amount: amount === "" ? null : Number(amount),
      tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
      attachments: fileNames,
      detail,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div style={{ background: COLORS.panel }} className="w-full sm:max-w-lg sm:rounded-sm rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div style={{ borderBottom: `1px solid ${COLORS.hairline}` }} className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" >
          <div style={{ background: COLORS.panel }} className="absolute inset-0 -z-10" />
          <h2 style={{ fontFamily: "Georgia, serif", color: COLORS.ink }} className="text-lg">
            {initial ? "แก้ไขรายการ" : "เพิ่มรายการ Timeline"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-sm hover:bg-black/5"><X size={18} color={COLORS.inkSoft} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] mb-1.5" style={{ color: COLORS.inkSoft }}>หมวดหมู่</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    style={{
                      borderColor: active ? c.color : COLORS.hairline,
                      background: active ? c.color + "1a" : "transparent",
                      color: active ? c.color : COLORS.inkSoft,
                    }}
                    className="border rounded-sm px-2 py-2 text-[11px] flex flex-col items-center gap-1"
                  >
                    <Icon size={16} />
                    <span className="text-center leading-tight">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[12px] mb-1.5" style={{ color: COLORS.inkSoft }}>หัวข้อ</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ borderColor: COLORS.hairline, background: "#fff" }} className="w-full border rounded-sm px-3 py-2 text-sm" placeholder="เช่น เวทเทรนนิง Upper Body" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: COLORS.inkSoft }}>วันที่เกิดเหตุการณ์</label>
              <input type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} style={{ borderColor: COLORS.hairline, background: "#fff" }} className="w-full border rounded-sm px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: COLORS.inkSoft }}>ค่าใช้จ่าย (บาท)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ borderColor: COLORS.hairline, background: "#fff" }} className="w-full border rounded-sm px-3 py-2 text-sm font-mono" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] mb-1.5" style={{ color: COLORS.inkSoft }}>รายละเอียด</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ borderColor: COLORS.hairline, background: "#fff" }} className="w-full border rounded-sm px-3 py-2 text-sm resize-none" />
          </div>

          {fields.length > 0 && (
            <div style={{ borderTop: `1px dashed ${COLORS.hairline}` }} className="pt-4">
              <p style={{ color: catByKey[category].color }} className="text-[12px] font-medium mb-3">ข้อมูลเฉพาะหมวด {catByKey[category].label}</p>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((f) => (
                  <div key={f.key} className={f.type === "select" ? "col-span-2" : ""}>
                    <label className="block text-[12px] mb-1.5" style={{ color: COLORS.inkSoft }}>{f.label}</label>
                    {f.type === "select" ? (
                      <select value={detail[f.key] || ""} onChange={(e) => handleFieldChange(f.key, e.target.value)} style={{ borderColor: COLORS.hairline, background: "#fff" }} className="w-full border rounded-sm px-3 py-2 text-sm">
                        <option value="">เลือก...</option>
                        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type}
                        value={detail[f.key] || ""}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        style={{ borderColor: COLORS.hairline, background: "#fff" }}
                        className="w-full border rounded-sm px-3 py-2 text-sm font-mono"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: `1px dashed ${COLORS.hairline}` }} className="pt-4">
            <label className="block text-[12px] mb-1.5" style={{ color: COLORS.inkSoft }}>Tags (คั่นด้วยจุลภาค)</label>
            <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} style={{ borderColor: COLORS.hairline, background: "#fff" }} className="w-full border rounded-sm px-3 py-2 text-sm mb-3" placeholder="gym, health" />

            <label className="block text-[12px] mb-1.5" style={{ color: COLORS.inkSoft }}>ไฟล์แนบ (จำลอง Presigned Upload ไปยัง Cloudflare R2)</label>
            <label style={{ borderColor: COLORS.hairline }} className="border border-dashed rounded-sm px-3 py-3 flex items-center gap-2 text-sm cursor-pointer" >
              <Paperclip size={14} color={COLORS.inkSoft} />
              <span style={{ color: COLORS.inkSoft }}>เลือกไฟล์เพื่อแนบ</span>
              <input type="file" multiple className="hidden" onChange={handleFilePick} />
            </label>
            {fileNames.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {fileNames.map((f, i) => (
                  <li key={i} style={{ color: COLORS.inkSoft }} className="text-[12px] font-mono flex items-center gap-1">
                    <Paperclip size={11} />{f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.hairline}`, background: COLORS.panel }} className="sticky bottom-0 px-5 py-4 flex gap-3">
          <button onClick={onClose} style={{ borderColor: COLORS.hairline, color: COLORS.inkSoft }} className="flex-1 border rounded-sm py-2.5 text-sm">ยกเลิก</button>
          <button onClick={handleSubmit} style={{ background: COLORS.brand }} className="flex-1 text-white rounded-sm py-2.5 text-sm font-medium hover:opacity-90">บันทึกรายการ</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Dashboard — UC-08
----------------------------------------------------------------*/
function Dashboard({ items, onGoExpiring }) {
  const currentMonth = TODAY.getMonth();
  const currentYear = TODAY.getFullYear();
  const monthlyItems = items.filter((i) => {
    const d = new Date(i.occurredAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const countsByCategory = CATEGORIES.map((c) => ({
    ...c,
    count: monthlyItems.filter((i) => i.category === c.key).length,
  }));
  const totalExpense = monthlyItems.reduce((s, i) => s + (i.amount || 0), 0);
  const yearItems = items.filter((i) => new Date(i.occurredAt).getFullYear() === currentYear);
  const yearExpense = yearItems.reduce((s, i) => s + (i.amount || 0), 0);

  const expiringSoon = items.filter((i) => {
    const lvl = expiryLevel(i.detail?.expiresAt);
    return lvl && lvl.level !== "normal";
  }).sort((a, b) => daysUntil(a.detail.expiresAt) - daysUntil(b.detail.expiresAt));

  const monthName = TODAY.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontFamily: "Georgia, serif", color: COLORS.ink }} className="text-xl mb-1">{monthName}</h2>
        <p style={{ color: COLORS.inkSoft }} className="text-sm">สรุปรายเดือนและรายปีของคุณ</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {countsByCategory.filter((c) => c.count > 0 || true).slice(0, 9).map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.key} style={{ background: COLORS.panel, border: `1px solid ${COLORS.hairline}` }} className="rounded-sm p-3 flex items-center gap-3">
              <div style={{ background: c.color + "1a" }} className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0">
                <Icon size={16} color={c.color} />
              </div>
              <div className="min-w-0">
                <p style={{ color: COLORS.ink }} className="text-lg font-mono leading-none">{c.count}</p>
                <p style={{ color: COLORS.inkSoft }} className="text-[11px] truncate">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div style={{ background: COLORS.brandDeep }} className="rounded-sm p-4 text-white">
          <p className="text-[12px] opacity-80 mb-1">ค่าใช้จ่ายรวมเดือนนี้</p>
          <p className="text-xl font-mono">{totalExpense.toLocaleString("th-TH")} บาท</p>
        </div>
        <div style={{ background: COLORS.panelDeep, border: `1px solid ${COLORS.hairline}` }} className="rounded-sm p-4">
          <p style={{ color: COLORS.inkSoft }} className="text-[12px] mb-1">ค่าใช้จ่ายรวมปีนี้</p>
          <p style={{ color: COLORS.ink }} className="text-xl font-mono">{yearExpense.toLocaleString("th-TH")} บาท</p>
        </div>
      </div>

      <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.hairline}` }} className="rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: COLORS.ink, fontFamily: "Georgia, serif" }} className="text-[15px] flex items-center gap-2">
            <AlertTriangle size={16} color={COLORS.warn} /> รายการใกล้หมดอายุ
          </h3>
          <button onClick={onGoExpiring} style={{ color: COLORS.brand }} className="text-[12px] flex items-center gap-0.5 hover:underline">
            ดูทั้งหมด <ChevronRight size={13} />
          </button>
        </div>
        {expiringSoon.length === 0 ? (
          <p style={{ color: COLORS.inkSoft }} className="text-sm">ไม่มีรายการใกล้หมดอายุในขณะนี้</p>
        ) : (
          <div className="flex flex-col gap-2">
            {expiringSoon.slice(0, 4).map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-2 py-1.5" style={{ borderBottom: `1px solid ${COLORS.hairline}` }}>
                <div className="min-w-0 flex items-center gap-2">
                  <CategoryTag catKey={i.category} />
                  <span style={{ color: COLORS.ink }} className="text-sm truncate">{i.title}</span>
                </div>
                <ExpiryPill dateStr={i.detail.expiresAt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Expiring items page — UC-19
----------------------------------------------------------------*/
function ExpiringPage({ items }) {
  const withExpiry = items
    .filter((i) => i.detail?.expiresAt)
    .map((i) => ({ ...i, level: expiryLevel(i.detail.expiresAt), days: daysUntil(i.detail.expiresAt) }))
    .sort((a, b) => a.days - b.days);

  const groups = [
    { key: "expired", label: "หมดอายุแล้ว", color: COLORS.danger },
    { key: "critical", label: "สำคัญ (≤ 7 วัน)", color: COLORS.danger },
    { key: "warning", label: "แจ้งเตือน (≤ 30 วัน)", color: COLORS.warn },
    { key: "normal", label: "ปกติ", color: "#6E7B5C" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontFamily: "Georgia, serif", color: COLORS.ink }} className="text-xl mb-1">รายการใกล้หมดอายุ</h2>
        <p style={{ color: COLORS.inkSoft }} className="text-sm">ตรวจสอบ Insurance, Warranty, Document, Certificate และวันนัดหมาย</p>
      </div>
      {groups.map((g) => {
        const list = withExpiry.filter((i) => i.level.level === g.key);
        if (list.length === 0) return null;
        return (
          <div key={g.key}>
            <p style={{ color: g.color }} className="text-[12px] font-medium mb-2 uppercase tracking-wide">{g.label} · {list.length}</p>
            <div className="flex flex-col gap-2">
              {list.map((i) => (
                <div key={i.id} style={{ background: COLORS.panel, border: `1px solid ${COLORS.hairline}`, borderLeft: `4px solid ${g.color}` }} className="rounded-sm p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1"><CategoryTag catKey={i.category} /></div>
                    <p style={{ color: COLORS.ink }} className="text-sm truncate">{i.title}</p>
                    <p style={{ color: COLORS.inkSoft }} className="text-[12px] font-mono">หมดอายุ {formatDate(i.detail.expiresAt)}</p>
                  </div>
                  <ExpiryPill dateStr={i.detail.expiresAt} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {withExpiry.length === 0 && <p style={{ color: COLORS.inkSoft }} className="text-sm">ไม่มีรายการที่มีวันหมดอายุ</p>}
    </div>
  );
}

/* ---------------------------------------------------------------
   Timeline list with search + filter — UC-04, UC-05
----------------------------------------------------------------*/
function TimelinePage({ items, activeCategory, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [statusHasFile, setStatusHasFile] = useState(false);
  const [statusHasCost, setStatusHasCost] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = items
    .filter((i) => !activeCategory || i.category === activeCategory)
    .filter((i) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.tags?.some((t) => t.toLowerCase().includes(q)) ||
        Object.values(i.detail || {}).some((v) => String(v).toLowerCase().includes(q))
      );
    })
    .filter((i) => (statusHasFile ? i.attachments?.length > 0 : true))
    .filter((i) => (statusHasCost ? !!i.amount : true))
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div style={{ borderColor: COLORS.hairline, background: "#fff" }} className="flex-1 flex items-center gap-2 border rounded-sm px-3 py-2">
          <Search size={15} color={COLORS.inkSoft} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาหัวข้อ รายละเอียด แท็ก..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          style={{ borderColor: COLORS.hairline, color: showFilters ? COLORS.brand : COLORS.inkSoft, background: showFilters ? COLORS.brand + "12" : "transparent" }}
          className="border rounded-sm p-2.5"
        >
          <Filter size={15} />
        </button>
      </div>
      {showFilters && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusHasFile((v) => !v)}
            style={{ borderColor: statusHasFile ? COLORS.brand : COLORS.hairline, color: statusHasFile ? COLORS.brand : COLORS.inkSoft, background: statusHasFile ? COLORS.brand + "12" : "transparent" }}
            className="text-[12px] border rounded-full px-3 py-1"
          >มีไฟล์แนบ</button>
          <button
            onClick={() => setStatusHasCost((v) => !v)}
            style={{ borderColor: statusHasCost ? COLORS.brand : COLORS.hairline, color: statusHasCost ? COLORS.brand : COLORS.inkSoft, background: statusHasCost ? COLORS.brand + "12" : "transparent" }}
            className="text-[12px] border rounded-full px-3 py-1"
          >มีค่าใช้จ่าย</button>
        </div>
      )}

      <p style={{ color: COLORS.inkSoft }} className="text-[12px] font-mono">{filtered.length} รายการ</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {filtered.length === 0 && (
          <div style={{ color: COLORS.inkSoft }} className="col-span-2 text-center py-12 text-sm">ไม่พบรายการที่ตรงกับเงื่อนไข</div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   App shell
----------------------------------------------------------------*/
export default function App() {
  const { user, loading: authLoading, signInWithGoogle, signOut, error: authError } = useAuth();
  const [items, setItems] = useState(seedItems);
  const [view, setView] = useState("dashboard"); // dashboard | timeline | expiring
  const [activeCategory, setActiveCategory] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const saveItem = (item) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      return exists ? prev.map((p) => (p.id === item.id ? item : p)) : [item, ...prev];
    });
    setFormOpen(false);
    setEditing(null);
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setFormOpen(true); };

  const expiringCount = items.filter((i) => {
    const lvl = expiryLevel(i.detail?.expiresAt);
    return lvl && lvl.level !== "normal";
  }).length;

  if (authLoading) {
    return (
      <div style={{ background: COLORS.paper, minHeight: "100%" }} className="flex items-center justify-center">
        <p style={{ color: COLORS.inkSoft }} className="text-sm">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={signInWithGoogle} error={authError} />;

  const navItem = (key, label, Icon, badge) => (
    <button
      onClick={() => { setView(key); setActiveCategory(null); setSidebarOpen(false); }}
      style={{
        background: view === key ? COLORS.brand + "14" : "transparent",
        color: view === key ? COLORS.brand : COLORS.inkSoft,
      }}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-left"
    >
      <Icon size={16} />
      <span className="flex-1">{label}</span>
      {badge > 0 && <span style={{ background: COLORS.danger }} className="text-white text-[10px] rounded-full px-1.5 py-0.5 font-mono">{badge}</span>}
    </button>
  );

  return (
    <div style={{ background: COLORS.paper, minHeight: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }} className="flex h-full">
      {/* Sidebar */}
      <div
        style={{
          background: COLORS.panelDeep,
          borderRight: `1px solid ${COLORS.hairline}`,
          transform: sidebarOpen ? "translateX(0)" : undefined,
        }}
        className={`
          fixed sm:static z-40 inset-y-0 left-0 w-64 flex flex-col p-4 gap-1 transition-transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        <div className="flex items-center gap-2 px-2 pb-4">
          <div style={{ background: COLORS.brand }} className="w-8 h-8 rounded-sm flex items-center justify-center">
            <Clock size={16} color="#F8F5EC" />
          </div>
          <span style={{ fontFamily: "Georgia, serif", color: COLORS.ink }} className="text-lg">Ledger</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto sm:hidden p-1"><X size={18} color={COLORS.inkSoft} /></button>
        </div>

        {navItem("dashboard", "Dashboard", LayoutDashboard, 0)}
        {navItem("timeline", "Timeline ทั้งหมด", Clock, 0)}
        {navItem("expiring", "ใกล้หมดอายุ", AlertTriangle, expiringCount)}

        <p style={{ color: COLORS.inkSoft }} className="text-[11px] uppercase tracking-wide px-3 mt-4 mb-1">หมวดหมู่</p>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const count = items.filter((i) => i.category === c.key).length;
          const active = view === "timeline" && activeCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => { setView("timeline"); setActiveCategory(c.key); setSidebarOpen(false); }}
              style={{ background: active ? c.color + "16" : "transparent", color: active ? c.color : COLORS.inkSoft }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-left"
            >
              <Icon size={15} />
              <span className="flex-1 truncate">{c.label}</span>
              <span className="font-mono text-[11px]">{count}</span>
            </button>
          );
        })}

        <div style={{ borderTop: `1px solid ${COLORS.hairline}` }} className="mt-auto pt-3 flex items-center gap-2 px-2">
          <div style={{ background: COLORS.brand }} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-medium shrink-0">
            {(user.displayName || user.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p style={{ color: COLORS.ink }} className="text-[12px] truncate">{user.displayName || user.email}</p>
          </div>
          <button onClick={signOut} className="p-1.5 rounded-sm hover:bg-black/5" title="ออกจากระบบ">
            <LogOut size={14} color={COLORS.inkSoft} />
          </button>
        </div>
      </div>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-30 sm:hidden" />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div style={{ borderBottom: `1px solid ${COLORS.hairline}`, background: COLORS.paper }} className="flex items-center gap-3 px-4 sm:px-6 py-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="sm:hidden p-1.5 -ml-1.5">
            <ChevronRight size={18} color={COLORS.inkSoft} />
          </button>
          <div className="flex-1" />
          <button
            onClick={openAdd}
            style={{ background: COLORS.brand }}
            className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-sm text-sm font-medium hover:opacity-90"
          >
            <Plus size={15} /> <span className="hidden sm:inline">เพิ่มรายการ</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {view === "dashboard" && <Dashboard items={items} onGoExpiring={() => setView("expiring")} />}
          {view === "timeline" && (
            <TimelinePage items={items} activeCategory={activeCategory} onEdit={openEdit} onDelete={deleteItem} />
          )}
          {view === "expiring" && <ExpiringPage items={items} />}
        </div>
      </div>

      {formOpen && (
        <ItemForm
          initial={editing}
          onSave={saveItem}
          onClose={() => { setFormOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
