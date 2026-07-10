/**
 * TalentEditProfileV2 — Talent Portal "EDIT PROFILE" form.
 *
 * Figma 7256:18622 (fileKey vuZ77RgLUVtzfJKAhb1EEX). Two-card layout: left
 * Profile Form Card (editable inputs + textareas, Cancel/Save) + right Media
 * Upload Card (three status rows with Replace/Upload links, a "Before submitting"
 * note, and a Submit-for-review CTA). Defaults come from TALENT_PROFILE.editForm /
 * TALENT_CASTING_MEDIA in mockData. Rendered inside TalentV2Layout.
 *
 * Route: /talent-v2/profile/edit. Buttons/links fire sonner toasts (preview only);
 * Cancel + Save navigate back to /talent-v2/profile.
 */
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import TalentV2Layout from "./TalentV2Layout";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Separator } from "@/components/shadcn/separator";
import {
  TALENT_PROFILE,
  TALENT_CASTING_MEDIA,
  TALENT_MEDIA_STATUS_STYLES,
} from "./mockData";

const LIME = "#d8ff00";
const GREEN_LINK = "#5b6f00";

function Field({ label, defaultValue }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-[#09090b]">{label}</Label>
      <Input
        defaultValue={defaultValue}
        className="mt-1.5 h-11 border-[#e0e0e0] bg-white text-sm text-[#09090b]"
      />
    </div>
  );
}

function AreaField({ label, defaultValue, rows = 3 }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-[#09090b]">{label}</Label>
      <Textarea
        defaultValue={defaultValue}
        rows={rows}
        className="mt-1.5 border-[#e0e0e0] bg-white text-sm text-[#09090b]"
      />
    </div>
  );
}

function UploadRow({ tile }) {
  const s = TALENT_MEDIA_STATUS_STYLES[tile.status];
  const tinted = tile.status === "Uploaded";
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border border-[#e0e0e0] p-4 ${
        tinted ? "bg-[#f2f6e1]" : "bg-white"
      }`}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#09090b]">
          {tile.editTitle || tile.title}
        </div>
        <p className="mt-1 text-sm text-[#71717a]">{tile.editDesc}</p>
        <span
          className={`mt-3 inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-semibold ${s.bg} ${s.text}`}
        >
          {tile.status}
        </span>
      </div>
      <button
        onClick={() => toast.info(tile.action)}
        className="shrink-0 text-sm font-semibold"
        style={{ color: GREEN_LINK }}
      >
        {tile.action}
      </button>
    </div>
  );
}

export default function TalentEditProfileV2() {
  const navigate = useNavigate();
  const f = TALENT_PROFILE.editForm;

  const save = () => {
    toast.success("Saved");
    navigate("/talent-v2/profile");
  };

  return (
    <TalentV2Layout>
      <div className="px-6 lg:px-8 py-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none text-[#09090b]">
            Edit Profile
          </h1>
          <p className="mt-3 max-w-[557px] text-sm text-[#71717a]">
            Update your profile information and upload required media for casting
            review.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT — Profile Form Card */}
          <div className="lg:col-span-2 rounded-lg border border-[#e0e0e0] bg-white p-6">
            <div className="text-base font-semibold text-[#09090b]">
              Profile details
            </div>
            <p className="mt-1 text-sm text-[#71717a]">
              Update casting details, contact information, skills, and campaign
              experience.
            </p>
            <Separator className="my-5 bg-[#e0e0e0]" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Legal name" defaultValue={f.legalName} />
              <Field label="Gender" defaultValue={f.gender} />
              <Field label="Age" defaultValue={f.age} />
              <Field label="Hourly rate" defaultValue={f.hourlyRate} />
              <Field label="Height" defaultValue={f.height} />
              <Field label="Ethnicity" defaultValue={f.ethnicity} />
              <Field label="Location" defaultValue={f.location} />
              <Field label="Type of model" defaultValue={f.typeOfModel} />
              <Field label="Email" defaultValue={f.email} />
              <Field label="Phone" defaultValue={f.phone} />
              <Field label="Languages" defaultValue={f.languages} />
              <Field label="Instagram" defaultValue={f.instagram} />
            </div>

            <div className="mt-4 space-y-4">
              <AreaField label="Skills" defaultValue={f.skills} rows={2} />
              <AreaField
                label="Experience highlights"
                defaultValue={f.experienceHighlights}
                rows={3}
              />
              <AreaField
                label="Notable campaigns"
                defaultValue={f.notableCampaigns}
                rows={2}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => navigate("/talent-v2/profile")}
                className="inline-flex h-10 items-center rounded-md border border-[#e0e0e0] bg-white px-4 text-sm font-semibold text-[#09090b] transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="inline-flex h-10 items-center rounded-md border border-[#d8ff00] bg-[#d8ff00] px-4 text-sm font-semibold text-[#09090b] transition-colors hover:bg-[#c2e600] hover:border-[#c2e600]"
              >
                Save
              </button>
            </div>
          </div>

          {/* RIGHT — Media Upload Card */}
          <div className="rounded-lg border border-[#e0e0e0] bg-white p-6">
            <div className="text-base font-semibold text-[#09090b]">
              Media upload
            </div>
            <p className="mt-1 text-sm text-[#71717a]">
              Upload casting assets. Accepted formats: JPG, PNG, PDF. Keep files
              current for admin review.
            </p>
            <Separator className="my-5 bg-[#e0e0e0]" />

            <div className="space-y-4">
              {TALENT_CASTING_MEDIA.map((tile) => (
                <UploadRow key={tile.title} tile={tile} />
              ))}
            </div>

            <Separator className="my-5 bg-[#e0e0e0]" />

            <div className="text-sm font-semibold text-[#09090b]">
              Before submitting
            </div>
            <p className="mt-1 text-sm text-[#71717a]">
              Make sure your media is current, clear, and professional. Admins
              will review changes before using your profile for shortlist
              submissions.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  toast.success("Submitted for review");
                  navigate("/talent-v2/profile");
                }}
                className="inline-flex h-10 items-center rounded-md border border-[#d8ff00] bg-[#d8ff00] px-4 text-sm font-semibold text-[#09090b] transition-colors hover:bg-[#c2e600] hover:border-[#c2e600]"
              >
                Submit for review
              </button>
            </div>
          </div>
        </div>
      </div>
    </TalentV2Layout>
  );
}

export { LIME };
