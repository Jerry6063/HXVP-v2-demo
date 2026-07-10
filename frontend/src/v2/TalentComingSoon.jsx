/**
 * TalentComingSoon — placeholder page for talent-portal nav items that have no
 * design yet (Bookings, Calendar, Documents, Messages, Revenue).
 *
 * Reads the requested section from the ?section= query param and shows a simple
 * "Coming soon" panel inside TalentV2Layout so the sidebar stays consistent.
 * Route: /talent-v2/coming-soon.
 */
import { useSearchParams } from "react-router-dom";
import { Clock } from "lucide-react";

import TalentV2Layout from "./TalentV2Layout";

export default function TalentComingSoon() {
  const [params] = useSearchParams();
  const section = params.get("section") || "This section";

  return (
    <TalentV2Layout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-[#eaffae] text-neutral-900">
          <Clock className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl uppercase tracking-tight leading-none">
          {section}
        </h1>
        <p className="mt-3 max-w-md text-sm text-neutral-500">
          This part of the Talent Portal is coming soon. Check back shortly — it
          is on the way.
        </p>
        <span className="mt-6 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
          Coming soon
        </span>
      </div>
    </TalentV2Layout>
  );
}
