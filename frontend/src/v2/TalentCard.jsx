/** Reusable talent card used by TalentsV2 and ShortlistV2. */
import { Checkbox } from "@/components/shadcn/checkbox";

function Chip({ children }) {
  return (
    <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">
      {children}
    </span>
  );
}

export default function TalentCard({ t, selectable = false, selected = false, onToggle }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white transition-colors ${
        selected ? "border-neutral-900 ring-1 ring-neutral-900" : "border-neutral-200"
      }`}
    >
      <div className="relative">
        <img
          src={`https://i.pravatar.cc/300?img=${t.img}`}
          alt={t.name}
          className="h-44 w-full bg-neutral-100 object-cover"
          loading="lazy"
        />
        <span className="absolute left-2 top-2 rounded-md bg-[#D8FF00] px-2 py-0.5 text-[11px] font-medium text-neutral-900">
          Available
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-neutral-900/85 px-2 py-0.5 text-[11px] font-medium text-white">
          ${t.rate}/hr
        </span>
        {selectable && (
          <div className="absolute right-2 top-2">
            <Checkbox
              checked={selected}
              onCheckedChange={onToggle}
              className="size-5 border-white bg-white/90 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
            />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold">{t.name}</div>
        <div className="text-xs text-neutral-500">
          {t.role} · {t.city}
        </div>
        <div className="mt-1 line-clamp-1 text-xs text-neutral-600">
          {t.tagline}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Chip>{t.age}</Chip>
          <Chip>{t.height}</Chip>
          <Chip>{t.gender}</Chip>
          <Chip>{t.ethnicity}</Chip>
        </div>
      </div>
    </div>
  );
}
