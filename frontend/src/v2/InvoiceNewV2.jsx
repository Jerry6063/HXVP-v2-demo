/**
 * InvoiceNewV2 — Create-invoice form (invoice-generator.com style).
 * Mirrors Figma 7151:16266. A WYSIWYG invoice sheet that IS the editable
 * document: the whole card is made of inline-editable fields.
 *
 * Route: /production-v2/invoices/new (rendered inside V2Layout, Invoices nav
 * active). Header: Back + "New Invoice" title on the left; "Save and send"
 * (lime CTA) / "Save as draft" (outline) / trash / overflow on the right.
 *
 * Card: yellow logo tile + "INVOICE" wordmark + # field · sender address box +
 * Bill To/Ship To · Date/Payment Terms/Due Date/PO Number metadata column ·
 * line-items table + "+ Line Item" · Notes/Terms textareas + totals stack
 * (Subtotal, Tax % with "R", +Discount/+Shipping, Total, Amount Paid,
 * Balance Due). Primary actions navigate/toast; secondary actions toast.
 * Additive preview only; wrapped by V2Layout.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Send, Save, Trash2, MoreHorizontal, Plus } from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/shadcn/dropdown-menu";
import { INVOICE_SENDER, INVOICE_TERMS } from "./mockData";

const LIME = "#eaffae"; // button-secondary-green — CTA + active nav pill
const GREEN = "#5b6f00"; // fg-primary-green — link/accent text
const GOLD = "#fde68a"; // tag-yellow — logo placeholder tile

/** Payment-instructions block, verbatim from the spec (INVOICE_TERMS joined). */
const TERMS_TEXT = INVOICE_TERMS.join("\n");

/** Parse a loose numeric string (may contain $ , spaces) into a number. */
function toNumber(value) {
  const n = parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Format a number as USD with 2 decimals, e.g. 3000 → "$3,000.00". */
function formatUSD(value) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Bare, borderless inline input — reads like plain document text until focused. */
function GhostInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-transparent px-2 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 rounded-[6px] hover:bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-300 ${className}`}
    />
  );
}

/** Outlined field for the right-hand metadata column (label left / value right). */
function MetaRow({ label, value, placeholder }) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-32 shrink-0 text-sm font-medium text-neutral-700">
        {label}
      </label>
      <Input
        defaultValue={value}
        placeholder={placeholder}
        className="h-9 flex-1 rounded-[6px] text-right text-sm"
      />
    </div>
  );
}

export default function InvoiceNewV2() {
  const navigate = useNavigate();
  const [lineItems, setLineItems] = useState([
    {
      id: 1,
      item: "Social Media Content 50% Deposit",
      quantity: "1",
      rate: "3000",
    },
  ]);
  const [taxPct, setTaxPct] = useState("0");
  const [amountPaid, setAmountPaid] = useState("");

  const addLineItem = () =>
    setLineItems((rows) => [
      ...rows,
      { id: Date.now(), item: "", quantity: "", rate: "" },
    ]);

  const updateLineItem = (id, field, value) =>
    setLineItems((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );

  const lineAmount = (row) => toNumber(row.quantity) * toNumber(row.rate);
  const subtotal = lineItems.reduce((sum, r) => sum + lineAmount(r), 0);
  const total = subtotal * (1 + toNumber(taxPct) / 100);
  const balanceDue = total - toNumber(amountPaid);

  return (
    <V2Layout>
      <div className="min-h-screen bg-[#f7f7f2]">
        <div className="px-6 lg:px-8 py-6">
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Button
                variant="outline"
                onClick={() => navigate("/production-v2/invoices")}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <h1 className="text-lg font-semibold text-neutral-900">
                New Invoice
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  toast.success("Invoice saved");
                  navigate("/production-v2/invoices/2192/send");
                }}
                className="bg-[#eaffae] text-neutral-900 hover:bg-[#dcf58c] shadow-none"
              >
                <Send className="size-4" />
                Save and send
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Saved as draft")}
              >
                <Save className="size-4" />
                Save as draft
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Delete draft"
                onClick={() => {
                  toast.success("Draft deleted");
                  navigate("/production-v2/invoices");
                }}
              >
                <Trash2 className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More actions">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={() => toast.info("Duplicate")}>
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast.info("Download PDF")}>
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast.info("Print")}>
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => toast.info("Settings")}>
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Header divider */}
          <div className="mt-4 border-t border-[#e0e0e0]" />

          {/* Invoice card */}
          <div className="mx-auto mt-6 max-w-[960px] rounded-xl border border-neutral-200 bg-white p-8 shadow-sm lg:p-10">
            {/* 5a. Brand + INVOICE header */}
            <div className="flex items-start justify-between gap-6">
              <button
                type="button"
                onClick={() => toast.info("Upload logo")}
                aria-label="Upload logo"
                className="size-[90px] shrink-0 rounded-lg"
                style={{ backgroundColor: GOLD }}
              />
              <div className="flex w-full max-w-[220px] flex-col items-end gap-2">
                <div className="font-display text-5xl uppercase leading-none tracking-tight text-neutral-900">
                  INVOICE
                </div>
                <div className="flex w-full items-center rounded-[6px] border border-[#e4e4e7] px-3">
                  <span className="pr-1 text-sm text-neutral-400">#</span>
                  <input
                    defaultValue="2192"
                    className="h-9 w-full bg-transparent text-right text-sm text-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 5b + 5c + 5d. Addresses row */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left: sender block + Bill To / Ship To */}
              <div>
                {/* Sender address box */}
                <div className="rounded-[6px] border border-[#e4e4e7] p-1">
                  <input
                    defaultValue={INVOICE_SENDER.name}
                    className="w-full bg-transparent px-2 py-1 text-sm font-medium text-neutral-900 outline-none rounded-[6px] hover:bg-neutral-50 focus:bg-white"
                  />
                  {INVOICE_SENDER.addressLines.map((line, i) => (
                    <input
                      key={i}
                      defaultValue={line}
                      className="w-full bg-transparent px-2 py-1 text-sm text-neutral-700 outline-none rounded-[6px] hover:bg-neutral-50 focus:bg-white"
                    />
                  ))}
                </div>

                {/* Bill To / Ship To */}
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Bill To
                    </label>
                    <Input
                      defaultValue="3W Management Inc"
                      className="h-9 rounded-[6px] text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Ship To
                    </label>
                    <Input
                      placeholder="(optional)"
                      className="h-9 rounded-[6px] text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right: metadata column */}
              <div className="space-y-3 lg:pt-1">
                <MetaRow label="Date" value="Jun 29, 2026" />
                <MetaRow label="Payment Terms" placeholder="" />
                <MetaRow label="Due Date" value="Jul 3, 2026" />
                <MetaRow label="PO Number" placeholder="" />
              </div>
            </div>

            {/* 5e. Line-items table */}
            <div className="mt-8">
              {/* Header strip */}
              <div className="grid grid-cols-[1fr_110px_130px_130px] items-center gap-2 border-y border-[#e0e0e0] bg-[#f8f9fa] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <div>Item</div>
                <div className="text-right">Quantity</div>
                <div className="text-right">Rate</div>
                <div className="text-right">Amount</div>
              </div>

              {/* Rows */}
              {lineItems.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_110px_130px_130px] items-center gap-2 border-b border-[#e0e0e0] px-1 py-1"
                >
                  <GhostInput
                    value={row.item}
                    onChange={(e) =>
                      updateLineItem(row.id, "item", e.target.value)
                    }
                    placeholder="Description of item/service…"
                  />
                  <GhostInput
                    value={row.quantity}
                    onChange={(e) =>
                      updateLineItem(row.id, "quantity", e.target.value)
                    }
                    className="text-right"
                  />
                  <div className="flex items-center rounded-[6px] hover:bg-neutral-50 focus-within:bg-white focus-within:ring-1 focus-within:ring-neutral-300">
                    <span className="pl-2 text-sm text-neutral-400">$</span>
                    <input
                      value={row.rate}
                      onChange={(e) =>
                        updateLineItem(row.id, "rate", e.target.value)
                      }
                      className="w-full bg-transparent px-1 py-1.5 text-right text-sm text-neutral-900 outline-none"
                    />
                  </div>
                  <div className="px-2 py-1.5 text-right text-sm font-semibold text-neutral-900">
                    {formatUSD(lineAmount(row))}
                  </div>
                </div>
              ))}

              {/* + Line Item */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={addLineItem}
                  className="inline-flex items-center gap-1 rounded-[6px] border border-[#e4e4e7] px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
                  style={{ color: GREEN }}
                >
                  <Plus className="size-4" />
                  Line Item
                </button>
              </div>
            </div>

            {/* 5f + 5g. Footer two-column zone */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left: Notes + Terms */}
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Notes – any relevant information not already covered"
                    className="min-h-20 resize-y rounded-[6px] text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Terms
                  </label>
                  <Textarea
                    defaultValue={TERMS_TEXT}
                    className="min-h-44 resize-y rounded-[6px] text-sm"
                  />
                </div>
              </div>

              {/* Right: totals stack */}
              <div className="lg:pl-6">
                {/* Subtotal */}
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="font-medium text-neutral-700">Subtotal</span>
                  <span className="font-medium text-neutral-900">
                    {formatUSD(subtotal)}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="font-medium text-neutral-700">Tax</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-[6px] border border-[#e4e4e7]">
                      <input
                        value={taxPct}
                        onChange={(e) => setTaxPct(e.target.value)}
                        className="h-8 w-14 bg-transparent px-2 text-right text-sm text-neutral-900 outline-none"
                      />
                      <span className="pr-2 text-sm text-neutral-400">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info("Recalculate tax")}
                      aria-label="Recalculate tax"
                      className="inline-flex size-8 items-center justify-center rounded-[6px] border border-[#e4e4e7] text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                    >
                      R
                    </button>
                  </div>
                </div>

                {/* + Discount / + Shipping */}
                <div className="flex items-center gap-4 py-1.5">
                  <button
                    type="button"
                    onClick={() => toast.info("Add discount")}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: GREEN }}
                  >
                    <Plus className="size-3.5" />
                    Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Add shipping")}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: GREEN }}
                  >
                    <Plus className="size-3.5" />
                    Shipping
                  </button>
                </div>

                {/* Totals divider */}
                <div className="my-1 border-t border-[#e0e0e0]" />

                {/* Total */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-base font-semibold text-neutral-900">
                    Total
                  </span>
                  <span className="text-base font-semibold text-neutral-900">
                    {formatUSD(total)}
                  </span>
                </div>

                {/* Amount Paid */}
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="font-medium text-neutral-700">
                    Amount Paid
                  </span>
                  <div className="flex w-28 items-center rounded-[6px] border border-[#e4e4e7]">
                    <span className="pl-2 text-sm text-neutral-400">$</span>
                    <input
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="h-8 w-full bg-transparent px-1 text-right text-sm text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                {/* Balance divider */}
                <div className="my-1 border-t border-[#e0e0e0]" />

                {/* Balance Due */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-base font-semibold text-neutral-900">
                    Balance Due
                  </span>
                  <span className="text-base font-semibold text-neutral-900">
                    {formatUSD(balanceDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}

export { LIME };
