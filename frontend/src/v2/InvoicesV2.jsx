/**
 * InvoicesV2 — "My Invoices" list page. Mirrors Figma 7130:15928 (variant A) and
 * 7118:15039 (variant B). Reconciled: the two Figma frames are the SAME page —
 * variant B is variant A with a per-row action dropdown open. This implements the
 * richer variant B (kebab dropdown: Copy Link / Edit / Mark as Paid / Duplicate /
 * Delete) with the menu reachable per row.
 *
 * Route: /production-v2/invoices (rendered inside V2Layout, Invoices nav active).
 * Header: League-Gothic "MY INVOICES" title + subtitle; right actions Export /
 * Import (outline) and a lime "New Invoice" split button (chevron). Single white
 * card: card title bar, table (Reference / Customer / Date / Due Date / Status /
 * Total + kebab), footer "Showing 11 of 48 invoices" + Previous / Next.
 *
 * Links: Reference / row click → invoice detail; customer → client details;
 * New Invoice → new-invoice route. Additive preview only; wrapped by V2Layout.
 */
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FileInput,
  Import,
  ChevronDown,
  MoreHorizontal,
  Link as LinkIcon,
  Pencil,
  CircleCheck,
  Files,
  Trash2,
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
import {
  INVOICES,
  INVOICE_STATUS_STYLES,
  INVOICES_TOTAL_COUNT,
} from "./mockData";

const LIME = "#eaffae";

/** Slug → client-record id for the Client Details link. */
function clientSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function StatusBadge({ status }) {
  const s = INVOICE_STATUS_STYLES[status] ?? INVOICE_STATUS_STYLES.Viewed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${s.badge}`}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: s.dot }}
      />
      {status}
    </span>
  );
}

function RowMenu({ inv }) {
  const stop = (e) => e.stopPropagation();
  const item = (label) =>
    toast.success(`${label} — Invoice ${inv.reference.replace("Invoice ", "")}`);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={stop}>
        <button
          className="inline-flex size-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
          aria-label="Row actions"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44" onClick={stop}>
        <DropdownMenuItem onSelect={() => item("Copy Link")}>
          <LinkIcon className="size-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => item("Edit")}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => item("Mark as Paid")}>
          <CircleCheck className="size-4" />
          Mark as Paid
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => item("Duplicate")}>
          <Files className="size-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => item("Delete")}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function InvoicesV2() {
  const navigate = useNavigate();
  const rows = INVOICES; // 11 rows, verbatim from spec

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none">
              My Invoices
            </h1>
            {/* Yina's frame reuses the time-log subtitle here (copy-paste
                slip) — replaced with invoice wording, same tone. */}
            <p className="mt-2 text-sm text-neutral-500">
              Create, send, and track client invoices and payments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => toast.info("Export")}>
              <FileInput className="size-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => toast.info("Import")}>
              <Import className="size-4" />
              Import
            </Button>
            <Button
              onClick={() => navigate("/production-v2/invoices/new")}
              className="bg-[#eaffae] text-neutral-900 hover:bg-[#dcf58c] shadow-none"
            >
              New Invoice
              <ChevronDown className="size-4" />
            </Button>
          </div>
        </div>

        {/* Card */}
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {/* Card title bar */}
          <div className="border-b border-neutral-100 px-6 py-4">
            <h2 className="text-base font-semibold text-neutral-900">
              MY INVOICES
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  <th className="px-6 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() =>
                      navigate(`/production-v2/invoices/${inv.id}`)
                    }
                    className="cursor-pointer border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-[#5b6f00] hover:underline">
                        {inv.reference}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/production-v2/clients/${clientSlug(inv.customer)}`
                          );
                        }}
                        className="text-left font-semibold text-neutral-900 hover:underline"
                      >
                        {inv.customer}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-600">{inv.date}</td>
                    <td className="px-4 py-3.5 text-neutral-600">
                      {inv.dueDate}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-neutral-900">
                      {inv.total}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <RowMenu inv={inv} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4">
            <div className="text-sm text-neutral-500">
              Showing {rows.length} of {INVOICES_TOTAL_COUNT} invoices
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}

export { LIME };
