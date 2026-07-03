/**
 * InvoiceSendV2 — "Send by Email" compose step for an invoice.
 * Mirrors Figma 7159:16466. Route /production-v2/invoices/:id/send, rendered
 * inside V2Layout (Invoices nav active). A single white card holds the compose
 * form: title + invoice meta line (# · client · date · total), Recipient Email
 * (empty, placeholder) + helper, pre-filled Recipient Name, Message textarea +
 * helper, and left-aligned Send / Cancel actions. A right info panel lists what
 * the email will include (static checklist).
 *
 * Data: the meta line reads the #2192 record from INVOICES (falls back to local
 * constants). Back / Cancel return to the invoice detail; Send toasts + returns.
 * Additive preview only.
 */
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Send, Check } from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { INVOICES } from "./mockData";

/** Send button lime — distinct from the sidebar-active pill (#eaffae) and green text (#5b6f00). */
const SEND_LIME = "#d9f99d";

/** Meta-line fallback (verbatim from spec) if the #2192 record isn't found. */
const FALLBACK_INVOICE = {
  reference: "Invoice #2192",
  customer: "3W Management Inc",
  date: "Jun 29, 2026",
  total: "$3,000.00",
};

const EMAIL_INCLUDES = [
  "Link to view and pay Invoice",
  "Invoice as a PDF attachment",
  "Your email as the reply-to address",
];

export default function InvoiceSendV2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detailPath = `/production-v2/invoices/${id}`;

  const invoice =
    INVOICES.find((inv) => inv.id === id) ?? INVOICES[0] ?? FALLBACK_INVOICE;

  const handleSend = () => {
    toast.success(`Invoice sent — ${invoice.reference}`);
    navigate(detailPath);
  };

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header row: Back button, then divider */}
        <Button variant="outline" onClick={() => navigate(detailPath)}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="mt-6 border-b border-[#e0e0e0]" />

        {/* Send by Email card */}
        <div className="mt-6 rounded-lg border border-[#e0e0e0] bg-white">
          <div className="px-8 py-6 lg:px-12 lg:py-8">
            {/* Title */}
            <h1
              className="text-2xl font-extrabold leading-snug text-[#09090b]"
              style={{ letterSpacing: "-0.72px" }}
            >
              Send by Email
            </h1>

            {/* Meta line: # · client · date · total */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="text-[#71717a]">{invoice.reference}</span>
              <span className="text-[#71717a]">·</span>
              <span className="font-medium text-[#5b6f00]">
                {invoice.customer}
              </span>
              <span className="text-[#71717a]">·</span>
              <span className="text-[#71717a]">{invoice.date}</span>
              <span className="text-[#71717a]">·</span>
              <span className="font-semibold text-[#09090b]">
                {invoice.total}
              </span>
            </div>

            {/* Divider under title/meta */}
            <div className="mt-5 border-b border-[#e0e0e0]" />

            {/* Body: form column + right info panel */}
            <div className="mt-6 flex flex-col gap-8 lg:flex-row">
              {/* Form column */}
              <div className="w-full lg:max-w-[978px] lg:flex-1">
                {/* Row 1: Recipient Email + Recipient Name */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="recipient-email"
                      className="text-[#09090b]"
                    >
                      Recipient Email
                    </Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      placeholder="customer@example.com"
                      className="mt-2 h-12 rounded-md border-[#e0e0e0] text-sm"
                    />
                    <p className="mt-1.5 text-xs text-[#71717a]">
                      The email address where the document will be sent.
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="recipient-name"
                      className="text-[#09090b]"
                    >
                      Recipient Name
                    </Label>
                    <Input
                      id="recipient-name"
                      defaultValue="3W Management Inc"
                      className="mt-2 h-12 rounded-md border-[#e0e0e0] text-sm text-[#09090b]"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="mt-6">
                  <Label htmlFor="message" className="text-[#09090b]">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message (optional)"
                    className="mt-2 min-h-[118px] rounded-md border-[#e0e0e0] text-sm"
                  />
                  <p className="mt-1.5 text-xs text-[#71717a]">
                    Add a personal message to include in the email (optional).
                  </p>
                </div>

                {/* Footer divider (spans form column only) */}
                <div className="mt-8 border-b border-[#e0e0e0]" />

                {/* Actions — left-aligned under the form */}
                <div className="mt-6 flex items-center gap-3">
                  <Button
                    onClick={handleSend}
                    className="text-[#09090b] shadow-none hover:opacity-90"
                    style={{ backgroundColor: SEND_LIME }}
                  >
                    <Send className="size-4" />
                    Send
                  </Button>
                  <Button variant="outline" onClick={() => navigate(detailPath)}>
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Right info panel: THE EMAIL WILL INCLUDE */}
              <div className="w-full lg:w-[253px] lg:shrink-0">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">
                  The Email Will Include
                </h2>
                <ul className="mt-4 space-y-3">
                  {EMAIL_INCLUDES.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-[#5b6f00]" />
                      <span className="text-sm text-[#09090b]">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}
