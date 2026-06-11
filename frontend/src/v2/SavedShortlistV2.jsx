/**
 * SavedShortlistV2 — saved shortlist detail page. Mirrors /tmp/wf7.png.
 * Breadcrumb-style title, share / check-availability / delete actions, and the
 * shortlisted talent grid (reuses TalentCard + mockData). Additive preview;
 * wrapped by V2Layout (Talents nav active via route).
 */
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Share, CheckCircle2, Trash2, X } from "lucide-react";

import V2Layout from "./V2Layout";
import TalentCard from "./TalentCard";
import { Button } from "@/components/shadcn/button";
import { TALENTS, SHORTLIST_IDS } from "./mockData";

export default function SavedShortlistV2() {
  const navigate = useNavigate();
  const shortlisted = TALENTS.filter((t) => SHORTLIST_IDS.includes(t.id));

  const handleDelete = () => {
    toast.success("Shortlist deleted");
    navigate("/production-v2/talents");
  };

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Title row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-xl tracking-tight">
            <span className="text-neutral-400">Spring Lifestyle Collection</span>
            <span className="text-neutral-400"> / </span>
            <span className="font-semibold text-neutral-900">
              Spring Lifestyle Talent Shortlist
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Shortlist shared with client.")}
            >
              <Share className="size-4" />
              Share with Client
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/production-v2/shortlist")}
            >
              <CheckCircle2 className="size-4" />
              Check Availability
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-500 hover:text-neutral-900"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-500 hover:text-neutral-900"
              onClick={() => navigate("/production-v2/talents")}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Talent grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shortlisted.map((t) => (
            <TalentCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </V2Layout>
  );
}
