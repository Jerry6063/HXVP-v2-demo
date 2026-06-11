/** TalentsV2 — talent pool with multi-select + create-shortlist dialog. */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Search, PlusCircle, Star, ChevronRight } from "lucide-react";

import V2Layout from "./V2Layout";
import TalentCard from "./TalentCard";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { TALENTS } from "./mockData";

const FILTERS = [
  { ph: "All types", opts: ["Actor", "Model", "Dancer", "Hand Model"] },
  { ph: "All Genders", opts: ["Man", "Woman", "Non-binary"] },
  { ph: "All Ethnicities", opts: ["White", "Black", "Asian", "Mixed", "Indian"] },
  { ph: "All Ages", opts: ["18-25", "26-35", "36-45", "46+"] },
  { ph: "All Heights", opts: ["< 5ft 6in", "5ft 6in - 6ft", "> 6ft"] },
  { ph: "Available time", opts: ["This week", "This month", "Custom"] },
];

const SHORTLIST_NAME = "Sports Commercial Photo Talents Shortlist";

export default function TalentsV2() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState(SHORTLIST_NAME);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSave = () => {
    setDialogOpen(false);
    toast.success("Shortlist saved", { description: name });
    navigate("/production-v2/shortlist");
  };

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl tracking-tight leading-none">
              Talents
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Browse availability, rates, and casting fit across portfolios
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-56 max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input className="pl-9 bg-white" placeholder="Search talents..." />
            </div>
            <Button variant="outline">
              <PlusCircle className="size-4" />
              Add talent
            </Button>
            <Button
              disabled={selected.size === 0}
              onClick={() => setDialogOpen(true)}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none disabled:opacity-50"
            >
              Create Shortlist
              {selected.size > 0 ? ` (${selected.size})` : ""}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pool" className="mt-5">
          <TabsList>
            <TabsTrigger value="pool">Talent Pool</TabsTrigger>
            <TabsTrigger value="saved">Saved Shortlists</TabsTrigger>
          </TabsList>

          <TabsContent value="pool" className="mt-4">
            {/* Filter row */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <Select key={f.ph}>
                  <SelectTrigger className="h-8 bg-white text-xs">
                    <SelectValue placeholder={f.ph} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.opts.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-neutral-500"
                onClick={() => setSelected(new Set())}
              >
                reset
              </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {TALENTS.map((t) => (
                <TalentCard
                  key={t.id}
                  t={t}
                  selectable
                  selected={selected.has(t.id)}
                  onToggle={() => toggle(t.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <Link
              to="/production-v2/saved-shortlist"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-[#eaffae] text-neutral-900">
                <Star className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  Spring Lifestyle Talent Shortlist
                </div>
                <div className="text-xs text-neutral-500">
                  4 talents · Spring Lifestyle Collection
                </div>
              </div>
              <ChevronRight className="size-4 text-neutral-400" />
            </Link>
          </TabsContent>
        </Tabs>
      </div>

      {/* Save as a new shortlist dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as a new shortlist</DialogTitle>
            <p className="text-sm text-neutral-500">
              save and retrieve talents shortlist easily
            </p>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                className="bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Save to project</Label>
              <Select defaultValue={SHORTLIST_NAME}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SHORTLIST_NAME}>
                    {SHORTLIST_NAME}
                  </SelectItem>
                  <SelectItem value="E-Bike Launch Campaign">
                    E-Bike Launch Campaign
                  </SelectItem>
                  <SelectItem value="Smart Home Product Reveal">
                    Smart Home Product Reveal
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </V2Layout>
  );
}
