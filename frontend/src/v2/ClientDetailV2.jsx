/**
 * ClientDetailV2 — Client (company) profile record page. Mirrors Figma
 * 7153:16705. Reached from the Invoices / Clients area.
 *
 * Route: /production-v2/clients/:id (rendered inside V2Layout, Invoices nav
 * active). Layout: header bar (Back + "Client Details" title) over a divider,
 * then a single white "client detail shell" card containing —
 *   - client header row: 3W avatar box + company name, right cluster Edit + "…".
 *   - 4 KPI metrics (Invoices / Payments / Total Invoiced / Total Paid).
 *   - two-column card grid: left = Details + Bill To; right = Invoices table +
 *     Payments (empty state).
 *
 * Links: "+  New" → new-invoice route; invoice reference (green) → invoice
 * detail; Back → prior list. Edit / "…" fire toasts (mock). Additive preview
 * only; wrapped by V2Layout. Data from CLIENT_RECORDS (falls back to seeded).
 */
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  MoreHorizontal,
  IdCard,
  Receipt,
  ReceiptText,
  CreditCard,
} from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
import { CLIENT_RECORDS } from "./mockData";

/* --- design tokens (verbatim from spec §10) --- */
const GREEN = "#5b6f00"; // fg-primary-green: avatar initials, "+ New", ref link
const LIME_PALE = "#eaffae"; // button-secondary-green: avatar box fill
const LIME_BADGE = "#d9f99d"; // bg-lime-200: "Viewed" status badge
const GREY_PILL = "#f8f9fa"; // bg-light-grey: count badge + empty-state box
const LINE = "#e0e0e0"; // line-default: card borders + dividers
const MUTED = "#71717a"; // fg-muted

/** Grey count pill next to a card title. */
function CountBadge({ value }) {
  return (
    <span
      className="inline-flex h-[22px] min-w-[24px] items-center justify-center rounded-lg px-1.5 text-xs font-semibold"
      style={{ backgroundColor: GREY_PILL, color: MUTED }}
    >
      {value}
    </span>
  );
}

/** "Viewed" status badge — brighter lime (#d9f99d @80%) + filled dot. */
function ViewedBadge() {
  return (
    <span
      className="inline-flex h-[22px] items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold text-neutral-900"
      style={{ backgroundColor: `${LIME_BADGE}CC` }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: GREEN }}
      />
      Viewed
    </span>
  );
}

/** Inner white card with an icon + title header row over a divider. */
function SectionCard({ icon: Icon, title, count, action, children }) {
  return (
    <div
      className="rounded-lg border bg-white"
      style={{ borderColor: LINE }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: LINE }}
      >
        <Icon className="size-4 text-neutral-900" />
        <span className="text-base font-semibold text-neutral-900">
          {title}
        </span>
        {count != null && <CountBadge value={count} />}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </div>
  );
}

export default function ClientDetailV2() {
  const { id } = useParams();
  const navigate = useNavigate();

  const client =
    CLIENT_RECORDS.find((c) => c.id === id) ?? CLIENT_RECORDS[0];
  const { name, initials, created, billTo, metrics, invoices, payments } =
    client;

  const METRICS = [
    { label: "INVOICES", value: metrics.invoices },
    { label: "PAYMENTS", value: metrics.payments },
    { label: "TOTAL INVOICED", value: metrics.totalInvoiced },
    { label: "TOTAL PAID", value: metrics.totalPaid },
  ];

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header bar */}
        <div className="flex items-center gap-5">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <h1
            className="text-2xl font-extrabold text-neutral-900"
            style={{ letterSpacing: "-0.72px", lineHeight: 1.35 }}
          >
            Client Details
          </h1>
        </div>

        {/* Header divider */}
        <div className="mt-4 border-b" style={{ borderColor: LINE }} />

        {/* Client detail shell (single white card) */}
        <div
          className="mt-8 rounded-lg border bg-white p-6"
          style={{ borderColor: LINE }}
        >
          {/* Client header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex size-[50px] shrink-0 items-center justify-center rounded-lg text-base font-semibold"
                style={{ backgroundColor: LIME_PALE, color: GREEN }}
              >
                {initials}
              </div>
              <h2
                className="text-2xl font-extrabold text-neutral-900"
                style={{ letterSpacing: "-0.72px", lineHeight: 1.35 }}
              >
                {name}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                onClick={() => toast.info("Edit client")}
              >
                <Save className="size-4" />
                Edit
              </Button>
              <button
                onClick={() => toast.info("More actions")}
                aria-label="More actions"
                className="inline-flex size-9 items-center justify-center rounded-md text-neutral-900 hover:bg-neutral-100"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </div>
          </div>

          {/* Header divider */}
          <div className="mt-5 border-b" style={{ borderColor: LINE }} />

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-6 py-5 sm:grid-cols-4">
            {METRICS.map((m) => (
              <div key={m.label}>
                <div
                  className="text-xs font-semibold uppercase"
                  style={{ color: MUTED }}
                >
                  {m.label}
                </div>
                <div className="mt-1 text-base font-semibold text-neutral-900">
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Metrics divider */}
          <div className="border-b" style={{ borderColor: LINE }} />

          {/* Card grid: left (narrow) + right (wide) */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,430px)_1fr]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Details card */}
              <SectionCard icon={IdCard} title="Details">
                <div className="px-4 py-4">
                  <div className="text-xs" style={{ color: MUTED }}>
                    Created
                  </div>
                  <div className="mt-1 text-sm text-neutral-900">
                    {created}
                  </div>
                </div>
              </SectionCard>

              {/* Bill To card */}
              <SectionCard icon={Receipt} title="Bill To">
                <div className="px-4 py-4 text-sm text-neutral-900">
                  {billTo}
                </div>
              </SectionCard>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Invoices card (table) */}
              <SectionCard
                icon={ReceiptText}
                title="Invoices"
                count={invoices.length}
                action={
                  <button
                    onClick={() =>
                      navigate("/production-v2/invoices/new")
                    }
                    className="text-sm font-medium hover:underline"
                    style={{ color: GREEN }}
                  >
                    +&nbsp;&nbsp;New
                  </button>
                }
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr
                      className="border-b text-xs font-medium"
                      style={{ borderColor: LINE, color: MUTED }}
                    >
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr
                        key={inv.invoiceId}
                        className="border-b last:border-0"
                        style={{ borderColor: LINE }}
                      >
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() =>
                              navigate(
                                `/production-v2/invoices/${inv.invoiceId}`
                              )
                            }
                            className="font-semibold hover:underline"
                            style={{ color: GREEN }}
                          >
                            {inv.reference}
                          </button>
                        </td>
                        <td
                          className="px-4 py-3.5"
                          style={{ color: MUTED }}
                        >
                          {inv.date}
                        </td>
                        <td className="px-4 py-3.5">
                          {inv.status === "Viewed" && <ViewedBadge />}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-neutral-900">
                          {inv.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SectionCard>

              {/* Payments card (empty state) */}
              <SectionCard
                icon={CreditCard}
                title="Payments"
                count={payments.length}
              >
                <div className="p-4">
                  <div
                    className="flex h-[72px] items-center justify-center rounded-lg border border-dashed text-sm"
                    style={{
                      backgroundColor: GREY_PILL,
                      borderColor: LINE,
                      color: MUTED,
                    }}
                  >
                    No Payments found.
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}
