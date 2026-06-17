/**
 * MessagesV2 — reusable two-pane inbox shared by the Clients/Talents Messages
 * routes. Pass `title` (e.g. "CLIENTS MESSAGES") + a `messages` dataset.
 * Mirrors /tmp/nm_client_msg.png.
 */
import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Archive,
  Trash2,
  Clock,
  Tag,
  Mail,
  CornerUpLeft,
} from "lucide-react";

import V2Layout from "./V2Layout";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Badge } from "@/components/shadcn/badge";
import { Textarea } from "@/components/shadcn/textarea";
import { Checkbox } from "@/components/shadcn/checkbox";
import { MESSAGE_TAG_STYLES, MESSAGE_REPLY_TO } from "./mockData";

function ToolbarButton({ icon: Icon }) {
  return (
    <button className="flex size-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
      <Icon className="size-4" />
    </button>
  );
}

export default function MessagesV2({ title, messages }) {
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(messages[0]?.id);

  const filtered = messages.filter((m) => {
    const matchesQuery =
      query.trim() === "" ||
      `${m.sender} ${m.subject} ${m.preview}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesFilter = filter === "all" || m.tag === "Pending";
    return matchesQuery && matchesFilter;
  });

  const active = messages.find((m) => m.id === activeId) ?? messages[0];

  const handleSend = () => toast.success("Reply sent");

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none">
          {title}
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          {/* LEFT — message list */}
          <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Inbox</h2>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFilter("all")}
                    className={`rounded-md px-2 py-1 font-medium transition-colors ${
                      filter === "all"
                        ? "bg-[#eaffae] text-neutral-900"
                        : "text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    All Messages
                  </button>
                  <button
                    onClick={() => setFilter("unread")}
                    className={`rounded-md px-2 py-1 font-medium transition-colors ${
                      filter === "unread"
                        ? "bg-[#eaffae] text-neutral-900"
                        : "text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    Unread
                  </button>
                </div>
              </div>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  className="pl-9 bg-white"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-neutral-400">
                  No messages
                </div>
              )}
              {filtered.map((m) => {
                const isActive = m.id === active?.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveId(m.id)}
                    className={`block w-full px-4 py-3 text-left transition-colors ${
                      isActive ? "bg-[#f5ffd6]" : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-neutral-900">
                        {m.sender}
                      </span>
                      <span className="shrink-0 text-[11px] text-neutral-400">
                        {m.time}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-sm text-neutral-700">
                      {m.subject}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-neutral-400">
                      {m.preview}
                    </div>
                    {m.tag && (
                      <Badge
                        variant="outline"
                        className={`mt-2 ${MESSAGE_TAG_STYLES[m.tag]}`}
                      >
                        {m.tag}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT — conversation pane */}
          <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {active ? (
              <>
                <div className="flex items-center gap-1 border-b border-neutral-100 px-4 py-2">
                  <ToolbarButton icon={Archive} />
                  <ToolbarButton icon={Trash2} />
                  <ToolbarButton icon={Clock} />
                  <ToolbarButton icon={Tag} />
                  <ToolbarButton icon={Mail} />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold">
                        {active.sender}
                      </div>
                      <div className="text-sm text-neutral-700">
                        {active.subject}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                        <CornerUpLeft className="size-3" />
                        Reply to: {MESSAGE_REPLY_TO}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {active.time}
                    </span>
                  </div>

                  <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                    {active.body}
                  </div>
                </div>

                <div className="border-t border-neutral-100 px-6 py-4">
                  <Textarea
                    className="bg-white"
                    rows={3}
                    placeholder={`Reply ${active.sender}...`}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-neutral-600">
                      <Checkbox />
                      Mute this thread
                    </label>
                    <Button
                      onClick={handleSend}
                      className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
                Select a message to read
              </div>
            )}
          </div>
        </div>
      </div>
    </V2Layout>
  );
}
