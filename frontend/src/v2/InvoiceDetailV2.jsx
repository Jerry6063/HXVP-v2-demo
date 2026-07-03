/**
 * InvoiceDetailV2 — read-only detail view of one already-sent invoice.
 * Mirrors Figma 7132:15937 (Project — Existing Invoice Details).
 *
 * Route: /production-v2/invoices/:id (rendered inside V2Layout, Invoices nav
 * active). Two-column body: a large white "invoice document card" (printable
 * invoice: sender block, INVOICE wordmark, Bill To / dates, line-item table,
 * totals with emphasized Balance Due, Terms w/ Zelle + ACH info) and a narrow
 * grey "amount due summary card" on the right.
 *
 * Header: outline Back → invoices list, "Invoice #<id>" title + Viewed badge,
 * meta sub-row (date / customer link → client details / total), and right-side
 * actions Send (→ send route) / Download / Trash / ellipsis (secondary → toast).
 *
 * Data: the #2192 record from mockData.INVOICES carries the full document body
 * (billTo, lineItems, subtotal, tax, balanceDue) plus sender + terms constants.
 * This screen is the spec's "Viewed" frame, so the badge is forced to "Viewed"
 * here regardless of the list's default-state value. Additive preview only.
 */
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  UserRound,
  Send,
  Download,
  Trash2,
  Ellipsis,
} from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
import {
  INVOICES,
  INVOICE_SENDER,
  INVOICE_TERMS,
  INVOICE_STATUS_STYLES,
} from "./mockData";

/** Slug → client-record id for the Client Details link (matches InvoicesV2). */
function clientSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function InvoiceDetailV2() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Resolve the invoice record; fall back to the fully-specced #2192 record so
  // the document body always renders (only #2192 carries line items in mock).
  const invoice = useMemo(
    () => INVOICES.find((inv) => inv.id === id) ?? INVOICES[0],
    [id]
  );

  const {
    reference,
    customer,
    date,
    dueDate,
    total,
    billTo = customer,
    lineItems = INVOICES[0].lineItems,
    subtotal = INVOICES[0].subtotal,
    tax = INVOICES[0].tax,
    balanceDue = INVOICES[0].balanceDue,
  } = invoice;

  // This screen is the spec's "Viewed" frame — force the Viewed badge here.
  const viewed = INVOICE_STATUS_STYLES.Viewed;
  const invoiceNumber = reference.replace(/^Invoice #/, "");

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Left cluster: Back + title/badge + meta sub-row */}
          <div className="flex items-start gap-5">
            <Button
              variant="outline"
              className="h-10"
              onClick={() => navigate("/production-v2/invoices")}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#09090b]">
                  {reference}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${viewed.badge}`}
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: viewed.dot }}
                  />
                  Viewed
                </span>
              </div>
              {/* Meta sub-row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#71717a]">
                  <Calendar className="size-3.5" />
                  {date}
                </span>
                <button
                  onClick={() =>
                    navigate(`/production-v2/clients/${clientSlug(customer)}`)
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5b6f00] hover:underline"
                >
                  <UserRound className="size-3.5" />
                  {customer}
                </button>
                <span className="text-sm font-semibold text-[#71717a]">
                  {total}
                </span>
              </div>
            </div>
          </div>

          {/* Right cluster: action buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                navigate(`/production-v2/invoices/${invoice.id}/send`)
              }
              className="bg-[#eaffae] text-neutral-900 hover:bg-[#dcf58c] shadow-none"
            >
              <Send className="size-4" />
              Send
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Download invoice PDF")}
            >
              <Download className="size-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Delete invoice"
              onClick={() => toast.info("Delete invoice")}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="More actions"
              onClick={() => toast.info("More actions")}
            >
              <Ellipsis className="size-4" />
            </Button>
          </div>
        </div>

        {/* Divider under header */}
        <div className="mt-5 border-t border-[#e4e4e7]" />

        {/* Body: document card (left) + amount-due summary (right) */}
        <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-start">
          {/* Invoice document card */}
          <div className="flex-1 overflow-hidden rounded-lg border border-[#e0e0e0] bg-white">
            <div className="p-8 lg:p-10">
              {/* Top band: logo + sender (left), INVOICE wordmark (right) */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div
                    className="size-24 rounded-lg"
                    style={{ backgroundColor: "#fde68a" }}
                  />
                  <div className="mt-6 text-sm leading-5">
                    <div className="font-semibold text-[#09090b]">
                      {INVOICE_SENDER.name}
                    </div>
                    {INVOICE_SENDER.addressLines.map((line) => (
                      <div key={line} className="text-[#09090b]">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-display text-5xl leading-none text-[#09090b]"
                    style={{ letterSpacing: "1.92px" }}
                  >
                    INVOICE
                  </div>
                  <div className="mt-2 text-sm text-[#71717a]"># {invoiceNumber}</div>
                </div>
              </div>

              {/* Section divider */}
              <div className="my-8 border-t border-[#e0e0e0]" />

              {/* Bill To / dates block */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-medium tracking-[-0.03em] text-[#71717a]">
                    Bill To
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#09090b]">
                    {billTo}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center justify-end gap-8">
                    <span className="text-[#71717a]">Date</span>
                    <span className="min-w-24 text-[#09090b]">{date}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-8">
                    <span className="text-[#71717a]">Due Date</span>
                    <span className="min-w-24 text-[#09090b]">{dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Line-items table */}
              <div className="mt-8">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#f8f9fa] text-xs font-semibold text-[#71717a]">
                      <th className="rounded-l-lg px-4 py-3.5 font-semibold">
                        Item
                      </th>
                      <th className="px-4 py-3.5 text-right font-semibold">
                        Quantity
                      </th>
                      <th className="px-4 py-3.5 text-right font-semibold">
                        Rate
                      </th>
                      <th className="rounded-r-lg px-4 py-3.5 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((li, i) => (
                      <tr key={i} className="border-b border-[#e0e0e0]">
                        <td className="px-4 py-4 text-[#09090b]">{li.item}</td>
                        <td className="px-4 py-4 text-right text-[#09090b]">
                          {li.quantity}
                        </td>
                        <td className="px-4 py-4 text-right text-[#09090b]">
                          {li.rate}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-[#09090b]">
                          {li.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals block (right-aligned) */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#71717a]">Subtotal</span>
                    <span className="text-[#09090b]">{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#71717a]">Tax (0%)</span>
                    <span className="text-[#09090b]">{tax}</span>
                  </div>
                  <div className="my-2 border-t border-[#e0e0e0]" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#71717a]">Total</span>
                    <span className="text-[#09090b]">{total}</span>
                  </div>
                  <div className="my-2 border-t border-[#e0e0e0]" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-base font-semibold text-[#09090b]">
                      Balance Due
                    </span>
                    <span className="text-lg font-extrabold text-[#09090b]">
                      {balanceDue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms / payment info */}
              <div className="mt-10 w-[251px] max-w-full">
                <div className="text-xs font-medium text-[#71717a]">Terms</div>
                <div className="mt-3 space-y-3 text-xs leading-4 text-[#71717a]">
                  {INVOICE_TERMS.map((line, i) =>
                    line === "" ? (
                      <div key={i} className="h-2" aria-hidden />
                    ) : (
                      <div key={i}>{line}</div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Amount due summary card */}
          <aside className="w-full shrink-0 rounded-lg border border-[#e0e0e0] bg-[#f8f9fa] xl:w-[374px]">
            <div className="p-6">
              <div className="text-xs font-semibold uppercase text-[#71717a]">
                Amount Due
              </div>
              <div className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#09090b]">
                {balanceDue}
              </div>
              <div className="my-4 border-t border-[#e0e0e0]" />
              <div className="text-xs font-semibold uppercase text-[#71717a]">
                Due Date
              </div>
              <div className="mt-1 text-sm font-semibold text-[#09090b]">
                {dueDate}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[#71717a]">Total</span>
                <span className="text-sm font-semibold text-[#09090b]">
                  {total}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </V2Layout>
  );
}
