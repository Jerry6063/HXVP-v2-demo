/**
 * SubmitTimeV2 — Worker "Submit Time & Invoice" page (Figma 7210:17732).
 *
 * Talent/crew-facing form: a worker submits their logged work hours AND attaches
 * or builds an invoice in one combined action for admin review + payment approval.
 * This is the SUBMITTER's side (Save Draft / Submit for Review), NOT the admin
 * TimeLogReview master-detail. Route: /production-v2/submit-time (rendered inside
 * V2Layout; the "Invoices" nav item is the active route for this page per spec).
 *
 * Layout: page header (title + subtitle, two top-right buttons), then a two-column
 * card row — left "Time Log Details" form (~60%) with an inline yellow Review
 * Notice + Save Draft / Submit for Review, right "Invoice & Payment" panel (~40%)
 * with the invoice-method chooser, payment preview, and submission checklist.
 * Full-width footer banner "What happens after submission?".
 *
 * Payment preview total is COMPUTED from Total Billable Hours × Rate
 * (8.75 hrs × $70/hr = $612.50) per spec. Invoice-method rows are mutually
 * exclusive; "Build invoice from template" is pre-selected (lime highlight).
 * Secondary actions (Open Template / Upload PDF / Save Draft / Submit for Review)
 * fire sonner toasts. Additive preview only; wrapped by V2Layout.
 */
import { useState } from "react";
import { toast } from "sonner";
import { FileText, Upload, TriangleAlert } from "lucide-react";

import V2Layout from "./V2Layout";

const LIME = "#d8ff00"; // button-primary-green

/* ── Spec constants (verbatim strings — no matching mock export exists) ── */
const HEADER = {
  title: "Submit Time & Invoice",
  subtitle:
    "Submit your work hours and attach your invoice for admin review and payment approval.",
};

const TIME_LOG = {
  project: "E-Bike Launch Campaign",
  workDate: "Jul 10, 2026",
  role: "Model",
  callTime: "9:00 AM",
  wrapTime: "6:45 PM",
  wrapHelper: "+45 min over estimated wrap",
  breakDuration: "60 min",
  totalBillableHours: "8.75 hrs",
  totalHelper: "Calculated after break deduction",
  notes:
    "Outdoor riding shots ran longer than planned because the final street scene needed additional takes after sunset setup. Lunch break was 60 minutes.",
};

const REVIEW_NOTICE = {
  heading: "This submission may need admin review",
  body: "Submitted wrap time exceeds the scheduled estimate. Admin may approve the overtime or request a correction before payment.",
};

/* Payment preview — total is computed (8.75 × 70 = 612.50) per spec. */
const BILLABLE_HOURS = 8.75;
const RATE_PER_HOUR = 70;
const ESTIMATED_TOTAL = BILLABLE_HOURS * RATE_PER_HOUR; // 612.50

const FOOTER = {
  heading: "What happens after submission?",
  body: "Admin reviews your time log and invoice together. If hours, breaks, or invoice amount need correction, you will receive a change request before payment is approved.",
};

/* ── Small building blocks ─────────────────────────────────────────────── */

/** Field label + read-only-styled value box (bordered white input look). */
function Field({ label, value, helper, helperTone = "muted" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#09090b]">
        {label}
      </label>
      <div className="mt-1.5 flex h-10 w-full items-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm text-[#3f3f46]">
        {value}
      </div>
      {helper && (
        <p
          className={`mt-1.5 text-xs ${
            helperTone === "warn" ? "text-[#92600a]" : "text-[#71717a]"
          }`}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

/** Small uppercase section label used inside the right panel. */
function SectionLabel({ children }) {
  return (
    <div className="text-xs font-medium uppercase tracking-wide text-[#71717a]">
      {children}
    </div>
  );
}

/** Secondary (outline/white) button used for card / method-row actions. */
function OutlineButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-[#e4e4e7] bg-white px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
    >
      {children}
    </button>
  );
}

/** Primary lime submit button. */
function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 text-sm font-medium text-[#09090b] transition-colors hover:brightness-95"
      style={{ backgroundColor: LIME }}
    >
      {children}
    </button>
  );
}

export default function SubmitTimeV2() {
  // Invoice method is mutually exclusive; template builder pre-selected per spec.
  const [method, setMethod] = useState("template");

  const saveDraft = () => toast.info("Draft saved");
  const submitForReview = () => toast.success("Submitted for review");
  const estimatedTotalStr = `$${ESTIMATED_TOTAL.toFixed(2)}`; // "$612.50"

  return (
    <V2Layout>
      <div className="min-h-screen bg-[#f2f2ec]">
        <div className="px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none">
                {HEADER.title}
              </h1>
              <p className="mt-2 text-sm text-[#71717a]">{HEADER.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <OutlineButton onClick={saveDraft}>Save Draft</OutlineButton>
              <PrimaryButton onClick={submitForReview}>
                Submit for Review
              </PrimaryButton>
            </div>
          </div>

          {/* Two-column card row */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* ── LEFT CARD — Time Log Details ── */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-[#e4e4e7] bg-white">
                {/* Card header */}
                <div className="border-b border-[#e0e0e0] px-6 py-5">
                  <h2 className="text-lg font-semibold text-[#09090b]">
                    Time Log Details
                  </h2>
                  <p className="mt-1 text-sm text-[#71717a]">
                    Admin will review submitted hours against the project
                    schedule before approving payment.
                  </p>
                </div>

                {/* Form body */}
                <div className="px-6 py-5">
                  {/* Row 1 — 3 columns */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Field label="Project" value={TIME_LOG.project} />
                    <Field label="Work Date" value={TIME_LOG.workDate} />
                    <Field label="Role" value={TIME_LOG.role} />
                  </div>

                  {/* Row 2 — 4 columns */}
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Call Time" value={TIME_LOG.callTime} />
                    <Field
                      label="Wrap Time"
                      value={TIME_LOG.wrapTime}
                      helper={TIME_LOG.wrapHelper}
                      helperTone="warn"
                    />
                    <Field
                      label="Break Duration"
                      value={TIME_LOG.breakDuration}
                    />
                    <Field
                      label="Total Billable Hours"
                      value={TIME_LOG.totalBillableHours}
                      helper={TIME_LOG.totalHelper}
                    />
                  </div>

                  {/* Row 3 — Notes for Admin (textarea) */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium text-[#09090b]">
                      Notes for Admin
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={TIME_LOG.notes}
                      className="mt-1.5 w-full resize-none rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#71717a] outline-none focus:border-neutral-400"
                    />
                  </div>

                  {/* Exception / Review Notice — yellow alert */}
                  <div className="mt-5 rounded-md bg-[#fef3c7] p-4">
                    <div className="flex gap-3">
                      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-[#713f12]" />
                      <div>
                        <div className="text-sm font-semibold text-[#713f12]">
                          {REVIEW_NOTICE.heading}
                        </div>
                        <p className="mt-1 text-sm text-[#713f12]">
                          {REVIEW_NOTICE.body}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card action buttons */}
                  <div className="mt-6 flex items-center justify-end gap-2">
                    <OutlineButton onClick={saveDraft}>Save Draft</OutlineButton>
                    <PrimaryButton onClick={submitForReview}>
                      Submit for Review
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT CARD — Invoice & Payment ── */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[#e4e4e7] bg-white">
                {/* Card header */}
                <div className="border-b border-[#e0e0e0] px-6 py-5">
                  <h2 className="text-lg font-semibold text-[#09090b]">
                    Invoice &amp; Payment
                  </h2>
                  <p className="mt-1 text-sm text-[#71717a]">
                    Create an invoice from a template or attach an existing
                    invoice for admin review.
                  </p>
                </div>

                <div className="px-6 py-5">
                  {/* CHOOSE INVOICE METHOD */}
                  <SectionLabel>Choose Invoice Method</SectionLabel>

                  <div className="mt-3 space-y-3">
                    {/* Method 1 — Build from template (selected/lime) */}
                    <button
                      type="button"
                      onClick={() => setMethod("template")}
                      className={`flex w-full items-start gap-3 rounded-md p-4 text-left transition-colors ${
                        method === "template"
                          ? "bg-[#d9f99d]"
                          : "border border-[#e4e4e7] bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#09090b]">
                          Build invoice from template
                        </div>
                        <p className="mt-1 text-sm text-[#3f3f46]">
                          Prefills worker info, project, approved/submitted
                          hours, rate, and total from this time log.
                        </p>
                      </div>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Open Template");
                        }}
                        className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
                      >
                        <FileText className="mr-1.5 size-4" />
                        Open Template
                      </span>
                    </button>

                    {/* Method 2 — Upload existing invoice (plain) */}
                    <button
                      type="button"
                      onClick={() => setMethod("upload")}
                      className={`flex w-full items-start gap-3 rounded-md p-4 text-left transition-colors ${
                        method === "upload"
                          ? "bg-[#d9f99d]"
                          : "border border-[#e4e4e7] bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#09090b]">
                          Upload existing invoice
                        </div>
                        <p className="mt-1 text-sm text-[#71717a]">
                          Use this if you already have a PDF invoice ready.
                        </p>
                      </div>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Upload PDF");
                        }}
                        className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
                      >
                        <Upload className="mr-1.5 size-4" />
                        Upload PDF
                      </span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="my-5 border-t border-[#e0e0e0]" />

                  {/* PAYMENT PREVIEW */}
                  <SectionLabel>Payment Preview</SectionLabel>
                  <div className="mt-3 rounded-md bg-[#f8f9fa] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#71717a]">Billable hours</span>
                      <span className="text-[#09090b]">
                        {TIME_LOG.totalBillableHours}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-[#71717a]">Rate</span>
                      <span className="text-[#09090b]">${RATE_PER_HOUR}/hr</span>
                    </div>
                    <div className="my-3 border-t border-[#e4e4e7]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#09090b]">
                        Estimated invoice total
                      </span>
                      <span className="text-base font-semibold text-[#09090b]">
                        {estimatedTotalStr}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-5 border-t border-[#e0e0e0]" />

                  {/* SUBMISSION CHECKLIST */}
                  <SectionLabel>Submission Checklist</SectionLabel>
                  <ul className="mt-3 space-y-3">
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#5b6f00]" />
                      <span className="text-sm text-[#71717a]">
                        <span className="font-medium text-[#5b6f00]">
                          Choose template builder
                        </span>{" "}
                        or{" "}
                        <span className="font-medium text-[#5b6f00]">
                          upload an existing invoice
                        </span>
                        .
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#d4d4d8]" />
                      <span className="text-sm text-[#71717a]">
                        Invoice total should match submitted hours and rate.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#d4d4d8]" />
                      <span className="text-sm text-[#71717a]">
                        Admin reviews time log and invoice together before
                        payment.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width footer banner */}
          <div className="mt-6 rounded-md bg-[#eaffae] px-6 py-5">
            <div className="text-sm font-semibold text-[#09090b]">
              {FOOTER.heading}
            </div>
            <p className="mt-1 text-sm text-[#3f3f46]">{FOOTER.body}</p>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}

export { LIME };
