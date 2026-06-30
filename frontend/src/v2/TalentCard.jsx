/** Reusable talent card used by TalentsV2 and ShortlistV2. */
import { Checkbox } from "@/components/shadcn/checkbox";
import { Badge } from "@/components/shadcn/badge";

function Chip({ children }) {
  return (
    <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">
      {children}
    </span>
  );
}

export default function TalentCard({
  t,
  selectable = false,
  selected = false,
  onToggle,
  onOpen,
  review = false,
  preference = null,
  onPreference,
}) {
  const clickable = typeof onOpen === "function";
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
          onClick={clickable ? onOpen : undefined}
          className={`aspect-square w-full bg-neutral-100 object-cover object-top ${
            clickable ? "cursor-pointer" : ""
          }`}
          loading="lazy"
        />
        <Badge className="absolute left-[11px] top-[11px] rounded-[4px] border-transparent bg-lime-200 px-2 py-0.5 text-[12px] font-medium leading-4 text-neutral-900">
          Available
        </Badge>
        <span className="absolute bottom-2 right-2 rounded-[6px] bg-black/80 px-2 py-0.5 text-[11px] font-medium text-white">
          ${t.rate}/hr
        </span>
        {selectable && !review && (
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
        <div
          onClick={clickable ? onOpen : undefined}
          className={`font-semibold ${
            review
              ? "text-[18px] leading-7 text-neutral-950"
              : "text-sm"
          } ${clickable ? "cursor-pointer hover:underline" : ""}`}
        >
          {t.name}
        </div>
        <div
          className={
            review
              ? "text-[14px] font-medium text-neutral-500"
              : "text-xs text-neutral-500"
          }
        >
          {t.role} · {t.city}
        </div>
        <div
          className={`mt-1 line-clamp-1 ${
            review
              ? "text-[14px] leading-5 text-neutral-900"
              : "text-xs text-neutral-600"
          }`}
        >
          {t.tagline}
        </div>
        {review ? (
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <span className="flex items-center rounded-[4px] bg-[#f2f2ec] px-2 py-1 text-[12px] font-medium text-neutral-500">
              {t.age}
            </span>
            <span className="flex items-center rounded-[4px] bg-[#f2f2ec] px-2 py-1 text-[12px] font-medium text-neutral-500">
              {t.height}
            </span>
          </div>
        ) : (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Chip>{t.age}</Chip>
            <Chip>{t.height}</Chip>
            <Chip>{t.gender}</Chip>
            <Chip>{t.ethnicity}</Chip>
          </div>
        )}
        {review && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                onPreference?.(preference === "forward" ? null : "forward")
              }
              className={`flex-1 h-8 rounded-[8px] text-[12px] font-medium transition-colors ${
                preference === "forward"
                  ? "border border-transparent bg-[#eaffae] text-neutral-950"
                  : "border border-[#e4e4e7] bg-white text-neutral-950"
              }`}
            >
              Move forward
            </button>
            <button
              type="button"
              onClick={() =>
                onPreference?.(preference === "pass" ? null : "pass")
              }
              className={`flex-1 h-8 rounded-[8px] text-[12px] font-medium transition-colors ${
                preference === "pass"
                  ? "border border-[#a1a1aa] bg-[#f4f4f5] text-neutral-950"
                  : "border border-[#e4e4e7] bg-white text-neutral-950"
              }`}
            >
              Pass for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
