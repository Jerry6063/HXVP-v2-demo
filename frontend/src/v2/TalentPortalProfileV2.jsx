/**
 * TalentPortalProfileV2 — Talent Portal "PROFILE OVERVIEW" (Maya Lee, read view).
 *
 * Figma 7252:21674 (fileKey vuZ77RgLUVtzfJKAhb1EEX). Header (title + Edit Profile
 * button) → workflow-details card (photo + MAYA LEE + 4×3 field grid) → two
 * bottom cards (Experience/Campaigns + Casting media tiles). All copy verbatim
 * from the wf4 profile spec via TALENT_PROFILE / TALENT_CASTING_MEDIA in mockData.
 * Rendered inside TalentV2Layout.
 *
 * Named TalentPortalProfileV2 (not TalentProfileV2) because the latter already
 * exists as the PRODUCTION-portal talent-detail page at /production-v2/talent-
 * profile — that file is untouched. Route: /talent-v2/profile.
 */
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import TalentV2Layout from "./TalentV2Layout";
import { Separator } from "@/components/shadcn/separator";
import {
  TALENT_PROFILE,
  TALENT_CASTING_MEDIA,
  TALENT_MEDIA_STATUS_STYLES,
} from "./mockData";

const LIME = "#d8ff00";

function MediaTile({ tile }) {
  const s = TALENT_MEDIA_STATUS_STYLES[tile.status];
  const tinted = tile.status === "Uploaded";
  return (
    <div
      className={`flex flex-col rounded-lg border border-[#e0e0e0] p-5 ${
        tinted ? "bg-[#edf3dc]" : "bg-white"
      }`}
    >
      <div className="text-sm font-semibold text-[#09090b]">{tile.title}</div>
      <p className="mt-1 flex-1 text-sm text-[#71717a]">{tile.desc}</p>
      <span
        className={`mt-4 inline-flex h-7 items-center justify-center self-start rounded-full px-3 text-xs font-semibold ${s.bg} ${s.text}`}
      >
        {tile.status}
      </span>
    </div>
  );
}

export default function TalentPortalProfileV2() {
  const navigate = useNavigate();
  const p = TALENT_PROFILE;

  return (
    <TalentV2Layout>
      <div className="px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none text-[#09090b]">
              Profile Overview
            </h1>
            <p className="mt-3 text-sm text-[#71717a]">
              Review your casting profile, media, skills, and campaign experience
              before admin review.
            </p>
          </div>
          <button
            onClick={() => navigate("/talent-v2/profile/edit")}
            className="inline-flex h-10 shrink-0 items-center rounded-md bg-[#d8ff00] px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-[#c2e600]"
          >
            Edit Profile
          </button>
        </div>

        {/* Workflow-details card */}
        <div className="mt-8 rounded-lg border border-[#e4e4e7] bg-white p-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            <img
              src={p.photo}
              alt={p.name}
              className="size-80 shrink-0 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none text-[#09090b]">
                  {p.name}
                </div>
                <button
                  onClick={() => toast.info("Message Me")}
                  className="inline-flex h-10 w-[142px] shrink-0 items-center justify-center rounded-md border border-[#e4e4e7] bg-[#fafafa] px-4 text-sm font-medium text-[#18181b] transition-colors hover:bg-neutral-100"
                >
                  Message Me
                </button>
              </div>

              {/* 4 × 3 field grid */}
              <div className="mt-6 grid grid-cols-2 gap-x-6 md:grid-cols-4">
                {p.overviewFields.map((f) => (
                  <div key={f.label} className="py-2">
                    <div className="text-xs text-[#71717a]">{f.label}</div>
                    <div className="mt-0.5 text-base font-medium text-[#09090b]">
                      {f.value}
                    </div>
                    <Separator className="mt-2 bg-[#e0e0e0]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row — two cards */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Experience and campaigns */}
          <div className="rounded-lg border border-[#e0e0e0] bg-white p-6">
            <div className="text-base font-semibold text-[#09090b]">
              Experience and campaigns
            </div>
            <p className="mt-1 text-sm text-[#71717a]">
              Highlights admins can use when matching you to production needs.
            </p>
            <Separator className="my-5 bg-[#e0e0e0]" />
            <div className="text-xs font-semibold text-[#71717a]">
              Experience highlights
            </div>
            <p className="mt-2 text-sm text-[#09090b]">{p.experience.highlights}</p>
            <Separator className="my-5 bg-[#e0e0e0]" />
            <div className="text-xs font-semibold text-[#71717a]">
              Notable campaigns
            </div>
            <p className="mt-2 text-sm text-[#09090b]">{p.experience.campaigns}</p>
          </div>

          {/* Casting media */}
          <div className="rounded-lg border border-[#e0e0e0] bg-white p-6">
            <div className="text-base font-semibold text-[#09090b]">
              Casting media
            </div>
            <p className="mt-1 text-sm text-[#71717a]">
              Media used by admins for casting review and client shortlist
              submissions.
            </p>
            <Separator className="my-5 bg-[#e0e0e0]" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TALENT_CASTING_MEDIA.map((tile) => (
                <MediaTile key={tile.title} tile={tile} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </TalentV2Layout>
  );
}

export { LIME };
