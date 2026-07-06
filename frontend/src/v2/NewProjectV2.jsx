/**
 * NewProjectV2 — "Create New Project" rendered as a page-level dialog over the
 * dashboard. Mirrors /tmp/hxvp_newproject.png. Closing navigates back to the
 * dashboard. "Create Production" fires sonner toasts then routes to talents.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarIcon, PlusCircle } from "lucide-react";

import DashboardV2 from "./DashboardV2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Calendar } from "@/components/shadcn/calendar";
import { CLIENTS } from "./mockData";

function Req() {
  return <span className="text-rose-500"> *</span>;
}

export default function NewProjectV2() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [date, setDate] = useState();
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setOpen(false);
    navigate("/production-v2");
  };

  const handleCreate = () => {
    setSubmitting(true);
    toast.loading("Creating project...", { id: "create-project" });
    setTimeout(() => {
      toast.success("Project created", {
        id: "create-project",
        description: "Your production is ready.",
      });
      navigate("/production-v2/talents");
    }, 1200);
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved");
    navigate("/production-v2");
  };

  return (
    <>
      {/* Dashboard stays mounted as the dimmed background */}
      <DashboardV2 />

      <Dialog open={open} onOpenChange={(v) => !v && close()}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-3xl tracking-tight">
              Create New Project
            </DialogTitle>
            <p className="text-sm">
              <span className="text-rose-500">*</span>Required Fields
            </p>
          </DialogHeader>

          <div className="space-y-5 border-t border-neutral-100 pt-5">
            {/* Client */}
            <div className="space-y-1.5">
              <Label>
                Client<Req />
              </Label>
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select an existing client" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENTS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="shrink-0">
                  <PlusCircle className="size-4" />
                  New Client
                </Button>
              </div>
              <p className="text-xs text-neutral-500">
                Select an existing client for this production or create a new
                client.
              </p>
            </div>

            {/* Project Name */}
            <div className="space-y-1.5">
              <Label>
                Project Name<Req />
              </Label>
              <Input className="bg-white" placeholder="type project name here" />
            </div>

            {/* Budget + Deadline */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  Budget ($)<Req />
                </Label>
                <Input className="bg-white" placeholder="type the budget here" />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Deadline<Req />
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white font-normal text-neutral-500"
                    >
                      {date ? date.toLocaleDateString() : "Pick a date"}
                      <CalendarIcon className="size-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Primary Location */}
            <div className="space-y-1.5">
              <Label>Primary Location</Label>
              <Input
                className="bg-white"
                placeholder="Venue, city, or general area"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                className="bg-white"
                rows={3}
                placeholder="This project is about..."
              />
            </div>

            {/* Talents Requirements */}
            <div className="space-y-1.5">
              <Label>Talents Requirements</Label>
              <Textarea className="bg-white" rows={3} />
            </div>

            {/* Crew Requirements */}
            <div className="space-y-1.5">
              <Label>Crew Requirements</Label>
              <Textarea className="bg-white" rows={3} />
            </div>
          </div>

          <DialogFooter className="border-t border-neutral-100 pt-4 sm:justify-end">
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              Create new project
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={submitting}>
              Save draft
            </Button>
            <Button variant="outline" onClick={close} disabled={submitting}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
