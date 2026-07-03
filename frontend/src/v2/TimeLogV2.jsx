/**
 * TimeLogV2 — global "Time Log Overview" console (Yina frame tlGlobal
 * 7085:14898 "Project Production Time and log").
 *
 * Route: /production-v2/time-log (rendered inside V2Layout). Admin-facing
 * review of ALL projects' submitted hours. Thin wrapper: V2Layout + the
 * global header (title + purpose subtitle) + the shared <TimeLogReview>
 * workspace (status tabs, Export/Approve, TIME LOGS table, Review detail).
 *
 * Yina's latest design dropped the old eyebrow ("TAFT Commercial · Time Logs")
 * and the header date-range pill; Export/Approve now live in the toolbar row
 * inside TimeLogReview. Additive preview only.
 */
import V2Layout from "./V2Layout";
import TimeLogReview from "./TimeLogReview";
import { TIME_LOGS } from "./mockData";

export default function TimeLogV2() {
  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none">
            Time Log Overview
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            Review submitted hours, resolve exceptions, and approve payroll-ready
            time logs.
          </p>
        </div>

        {/* Shared review workspace (global scope → each log shows its own project) */}
        <TimeLogReview logs={TIME_LOGS} />
      </div>
    </V2Layout>
  );
}
