/**
 * WorkerInvoiceV2 — Talent/Crew "New Invoice from template" builder.
 *
 * Figma node 7224:24979 (fileKey vuZ77RgLUVtzfJKAhb1EEX). Full-page editable
 * invoice COMPOSER shown to a Talent (or Crew) user creating a new invoice from
 * a template. The worker is the sender (Maya Lee) and HXVP is bill-to. The
 * distinctive workflow element vs. a generic new-invoice form is the primary
 * header CTA "Attach to time log" (not Send/Save) plus the Terms copy about
 * admin approving the time-log ↔ invoice match, and a time-based line-item
 * table whose middle column is "Hours" (not Qty).
 *
 * Route: /production-v2/build-invoice (rendered inside V2Layout; the sidebar
 * Invoices item is the active nav for this Finance-area page). Additive preview
 * only. Header secondary actions toast; primary "Attach to time log" navigates
 * to the invoices list to mirror the "bound & handed off" outcome.
 *
 * NOTE: the shipped mockData WORKER_INVOICE_TEMPLATE holds a DIFFERENT sample
 * (Andre Miller / #W-1042 / Zelle terms). This frame's spec pins exact strings
 * (Maya Lee / #2192 / ACH terms / 8.75h × $70). Per the build brief, spec text
 * is verbatim source-of-truth, so those literals live as local constants below.
 */
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/shadcn/dropdown-menu";

/* ── exact spec tokens ──────────────────────────────────────────────────── */
const PRIMARY_LIME = "#d8ff00"; // button-primary-green
const GREEN_LINK = "#5b6f00"; // fg-primary-green
const LOGO_YELLOW = "#fde68a"; // tag-yellow
const BORDER = "#e4e4e7"; // Border/default
const LINE = "#e0e0e0"; // line-default
const TABLE_FILL = "#f8f9fa"; // bg-light grey

/* ── invoice document data (verbatim from frame 7224:24979) ─────────────── */
const INVOICE = {
  number: "2192",
  from: {
    name: "Maya Lee",
    location: "Los Angeles, CA",
    email: "maya.lee@email.com",
  },
  billTo: "HXVP Marketing Group",
  shipTo: "", // placeholder "(optional)"
  date: "Jun 29, 2026",
  paymentTerms: "",
  dueDate: "Jul 3, 2026",
  poNumber: "",
  lineItem: {
    item: "Model services - E-Bike Launch Campaign",
    hours: "8.75",
    rate: "70",
    amount: "$612.50", // 8.75 × 70
  },
  notesPlaceholder: "Notes - any relevant information not already covered",
  terms:
    "ACH transfer preferred. Payment due after admin approves the time log and invoice match.",
  subtotal: "$612.50",
  total: "$612.50",
  balanceDue: "$612.50",
};

/* ── small building blocks ──────────────────────────────────────────────── */

/** Bordered white input box; value right-aligned (meta) or left (default). */
function FieldInput({ defaultValue, placeholder, className = "", align = "left" }) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-[#09090b] placeholder:text-[#71717a] outline-none focus:ring-2 focus:ring-[#d8ff00]/40 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
      style={{ borderColor: BORDER }}
    />
  );
}

/** label (left) + input (right) meta pair used in the right document column. */
function MetaRow({ label, defaultValue, placeholder }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3">
      <span className="text-sm font-medium text-[#3f3f46]">{label}</span>
      <FieldInput defaultValue={defaultValue} placeholder={placeholder} align="right" />
    </div>
  );
}

/** totals stack row: label (left) + value (right). */
function TotalRow({ label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span
        className={`text-sm ${
          bold ? "font-semibold text-[#09090b]" : "text-[#3f3f46]"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${
          bold ? "font-semibold text-[#09090b]" : "text-[#09090b]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * `layout` lets the SAME page render inside either the production shell
 * (V2Layout, default) or the talent shell (TalentV2Layout at /talent-v2/invoices)
 * without duplicating the page. Content is unchanged.
 */
export default function WorkerInvoiceV2({ layout: Layout = V2Layout }) {
  const navigate = useNavigate();
  const inv = INVOICE;

  const attach = () => {
    toast.success("Invoice attached to time log");
    navigate("/production-v2/invoices");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f7f7f2]">
        {/* ── Header row ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-4 border-b px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8"
          style={{ borderColor: LINE }}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="border-[#e4e4e7] bg-white text-[#09090b]"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <h1 className="text-lg font-bold text-[#09090b]">
              New Invoice from template
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={attach}
              className="text-[#09090b] shadow-none hover:brightness-95"
              style={{ backgroundColor: PRIMARY_LIME }}
            >
              Attach to time log
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Draft saved")}
              className="border-[#e4e4e7] bg-white text-[#09090b]"
            >
              Save as draft
            </Button>
            <button
              onClick={() => toast.success("Draft deleted")}
              aria-label="Delete draft"
              className="inline-flex size-8 items-center justify-center rounded-md text-[#3f3f46] hover:bg-neutral-100"
            >
              <Trash2 className="size-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="More actions"
                  className="inline-flex size-8 items-center justify-center rounded-md text-[#3f3f46] hover:bg-neutral-100"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => toast.success("Duplicated")}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast.success("Link copied")}>
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast.success("Printing…")}>
                  Print
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => toast.success("Draft deleted")}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Invoice card ───────────────────────────────────────────── */}
        <div className="px-6 py-6 lg:px-8">
          <div
            className="mx-auto max-w-4xl rounded-xl border bg-white p-6 lg:p-10"
            style={{ borderColor: BORDER }}
          >
            {/* Top band: logo + INVOICE + number */}
            <div className="flex items-start justify-between gap-6">
              <button
                aria-label="Upload logo"
                className="size-[120px] shrink-0 rounded-lg"
                style={{ backgroundColor: LOGO_YELLOW }}
              />
              <div className="flex flex-col items-end gap-3">
                <div className="font-display text-5xl uppercase leading-none text-[#09090b]">
                  Invoice
                </div>
                <div
                  className="flex h-9 w-40 items-center rounded-md border bg-white px-3"
                  style={{ borderColor: BORDER }}
                >
                  <span className="text-sm text-[#71717a]">#</span>
                  <input
                    type="text"
                    defaultValue={inv.number}
                    className="w-full bg-transparent text-right text-sm text-[#09090b] outline-none"
                    aria-label="Invoice number"
                  />
                </div>
              </div>
            </div>

            {/* Bill/Ship (left) + meta (right) */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left column */}
              <div className="space-y-4">
                <div
                  className="rounded-md border bg-white px-4 py-3"
                  style={{ borderColor: BORDER }}
                >
                  <div className="text-sm font-semibold text-[#09090b]">
                    {inv.from.name}
                  </div>
                  <div className="text-sm text-[#3f3f46]">
                    {inv.from.location}
                  </div>
                  <div className="text-sm text-[#3f3f46]">{inv.from.email}</div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#3f3f46]">
                    Bill To
                  </label>
                  <FieldInput defaultValue={inv.billTo} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#3f3f46]">
                    Ship To
                  </label>
                  <FieldInput placeholder="(optional)" />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-3">
                <MetaRow label="Date" defaultValue={inv.date} />
                <MetaRow label="Payment Terms" defaultValue={inv.paymentTerms} />
                <MetaRow label="Due Date" defaultValue={inv.dueDate} />
                <MetaRow label="PO Number" defaultValue={inv.poNumber} />
              </div>
            </div>

            {/* Line-items table */}
            <div
              className="mt-8 overflow-hidden rounded-md border"
              style={{ borderColor: BORDER }}
            >
              {/* header */}
              <div
                className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px] gap-3 px-4 py-2.5"
                style={{ backgroundColor: TABLE_FILL }}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">
                  Item
                </div>
                <div className="text-right text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">
                  Hours
                </div>
                <div className="text-right text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">
                  Rate
                </div>
                <div className="text-right text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">
                  Amount
                </div>
              </div>
              {/* data row */}
              <div className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px] items-center gap-3 px-4 py-3">
                <FieldInput defaultValue={inv.lineItem.item} />
                <FieldInput defaultValue={inv.lineItem.hours} align="right" />
                <div
                  className="flex h-9 items-center rounded-md border bg-white px-3"
                  style={{ borderColor: BORDER }}
                >
                  <span className="text-sm text-[#71717a]">$</span>
                  <input
                    type="text"
                    defaultValue={inv.lineItem.rate}
                    className="w-full bg-transparent text-right text-sm text-[#09090b] outline-none"
                    aria-label="Rate"
                  />
                </div>
                <div className="text-right text-sm font-semibold text-[#09090b]">
                  {inv.lineItem.amount}
                </div>
              </div>
            </div>

            {/* + Line Item */}
            <div className="mt-3">
              <button
                onClick={() => toast.success("Line item added")}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
                style={{ borderColor: BORDER, color: GREEN_LINK }}
              >
                <Plus className="size-4" />
                Line Item
              </button>
            </div>

            {/* Lower two-column: Notes/Terms (left) + totals (right) */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left: notes + terms */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#3f3f46]">
                    Notes
                  </label>
                  <textarea
                    placeholder={inv.notesPlaceholder}
                    rows={3}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm text-[#09090b] placeholder:text-[#71717a] outline-none focus:ring-2 focus:ring-[#d8ff00]/40"
                    style={{ borderColor: BORDER }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#3f3f46]">
                    Terms
                  </label>
                  <textarea
                    defaultValue={inv.terms}
                    rows={3}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm text-[#09090b] placeholder:text-[#71717a] outline-none focus:ring-2 focus:ring-[#d8ff00]/40"
                    style={{ borderColor: BORDER }}
                  />
                </div>
              </div>

              {/* Right: totals stack */}
              <div>
                <TotalRow label="Subtotal" value={inv.subtotal} />

                {/* Tax row: numeric input + % + R toggle */}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-[#3f3f46]">Tax</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      defaultValue="0"
                      aria-label="Tax"
                      className="h-8 w-14 rounded-md border bg-white px-2 text-right text-sm text-[#09090b] outline-none focus:ring-2 focus:ring-[#d8ff00]/40"
                      style={{ borderColor: BORDER }}
                    />
                    <span className="text-sm text-[#3f3f46]">%</span>
                    <button
                      onClick={() => toast.success("Tax rate toggled")}
                      aria-label="Toggle tax rate"
                      className="inline-flex size-8 items-center justify-center rounded-md border bg-white text-sm font-medium text-[#3f3f46] hover:bg-neutral-50"
                      style={{ borderColor: BORDER }}
                    >
                      R
                    </button>
                  </div>
                </div>

                {/* + Discount / + Shipping link actions */}
                <div className="flex items-center gap-4 py-1.5">
                  <button
                    onClick={() => toast.success("Discount added")}
                    className="text-sm font-medium hover:underline"
                    style={{ color: GREEN_LINK }}
                  >
                    + Discount
                  </button>
                  <button
                    onClick={() => toast.success("Shipping added")}
                    className="text-sm font-medium hover:underline"
                    style={{ color: GREEN_LINK }}
                  >
                    + Shipping
                  </button>
                </div>

                <div className="my-1 border-t" style={{ borderColor: LINE }} />
                <TotalRow label="Total" value={inv.total} bold />

                {/* Amount Paid input */}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-[#3f3f46]">Amount Paid</span>
                  <div
                    className="flex h-9 w-32 items-center rounded-md border bg-white px-3"
                    style={{ borderColor: BORDER }}
                  >
                    <span className="text-sm text-[#71717a]">$</span>
                    <input
                      type="text"
                      aria-label="Amount paid"
                      className="w-full bg-transparent text-right text-sm text-[#09090b] outline-none"
                    />
                  </div>
                </div>

                <div className="my-1 border-t" style={{ borderColor: LINE }} />
                <TotalRow label="Balance Due" value={inv.balanceDue} bold />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
