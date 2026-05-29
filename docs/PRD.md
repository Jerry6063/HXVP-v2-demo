# HXVP Studio v2 — Product Requirements Document

| Field | Value |
|---|---|
| **Version** | 0.3 (timeline compressed + user-flow inventory added) |
| **DRI** | Jerry Zheng |
| **Stakeholders** | Director (boss) · Original engineer (legacy context) · `yinadong-design` (design partner) |
| **Last updated** | 2026-05-28 |
| **Status** | 🟡 Draft v0.3 · pending director sign-off on §12 (User Flows) before any further build |
| **Key dates** | **6/15 internal milestone** · **early July production launch** |
| **Demo URL** | https://jerry6063.github.io/HXVP-v2-demo/ |
| **Private repo** | https://github.com/Jerry6063/HXVP-v2 (branch: `v2-redesign`) |
| **Public demo repo (MIT)** | https://github.com/Jerry6063/HXVP-v2-demo |

---

## Reading guide

> **Boss / non-tech reviewers**: read §1, §3, §5, §11 only (≈ 5 min).
> **Engineers / designers**: read everything plus appendices.
> **Discussion**: leave comments on the exported Google Doc; the canonical version lives in git.

---

# Part I — Strategic Overview (for Boss)

## 1. TL;DR

HXVP Studio v2 is a **focus refinement** of the existing studio operations portal. v1 (the version built by the previous engineer in collaboration with the director) is functionally complete but, per the director's 2026-05-28 review, feels unfocused, complex, and feature-bloated. v2 preserves the **4-portal architecture** (Production · Client · Talent · Crew) the director affirms is core to the workflow, but aggressively narrows each portal's purpose.

**One sentence**: *Fewer features, clearer paths, faster comprehension.*

### Timeline (compressed)

| Milestone | Date | Scope |
|---|---|---|
| **Sprint 0** ✅ | done by 5/28 | Visual baseline + Apple-style transitions + Production Dashboard Status Board + public demo |
| **Sprint 0.5** | 5/29 → 6/4 | Model-merge revert (4 portals restored) · Feature audit with director · **User-flow sign-off (§12)** |
| **Sprint 1 — 6/15 Internal Milestone** | 6/5 → 6/15 | All 4 portals' landing pages reflect "the one job" sentence · ⌘K global search · Tier-3 features hidden · **demo to boss** |
| **Sprint 2 — Early-July Launch** | 6/16 → 7/6 | Top user flows (§12) work end-to-end with v2 UI · Talent/Crew mobile-friendly · Activity Feed wired to real data · backend hookup if applicable · bug squash |
| Post-launch (v1.5) | 7/7 onward | Remaining ~50 deep detail pages · Shoot Command Center · Cascade prompts · Bulk operations |

### Why this version (v0.3) exists

Two changes since v0.2:

1. **Boss confirmed deadlines: 6/15 (internal milestone) + early July (launch).** The previous 6-sprint plan ending 8/10 was too loose. Reduced to **2 sprints + a 0.5 prep week**.
2. **Boss directive**: *"重点是 user flow 和 workflow,要列出来现在的让 boss 看看是不是对的."* — Section §12 below is the single most important deliverable of this week. **No further build proceeds until §12 flows are signed off.**

## 2. Background

| | |
|---|---|
| **What was inherited** | Full-stack platform: React 19 + Vite + Django REST + PostgreSQL, deployed on Render. ~74 frontend files, ~26 700 LOC, 55 portal pages, 150+ API endpoints, 4 user roles. |
| **Built by** | Previous engineer in collaboration with the director (boss). Functionally complete, in production at `hxvp-studio-frontend.onrender.com/production`. |
| **Why v2 now** | Director took the system to feature-completeness, then handed it to current owner (Jerry) for usability and quality polish. |
| **2026-05-28 director review** | Director reviewed v1 (main branch) and reaffirmed the 4-portal structure as core. Critique: "重点不突出 / 看起来很复杂 / 有些功能不是必要" — translated and analysed in §3. |
| **Constraint from boss** | "Don't break what works" + "Keep all 4 portals" + "Cut the fat." |

## 3. Problem Statement

**Director's verbatim feedback** (2026-05-28, on v1 main):

> 1. *重点不突出* — "The focus / what's important isn't obvious."
> 2. *看起来很复杂* — "It looks complex."
> 3. *有些功能不是必要* — "Some features aren't necessary."

**Reinterpretation** — three distinct problems hiding behind one complaint:

| # | Director's word | Concrete pain | Hypothesis |
|---|---|---|---|
| P1 | 重点不突出 | After login, the user can't tell what THE most important thing on this screen is | Dashboard treats all KPIs/lists as equal-weight; no visual hierarchy |
| P2 | 看起来很复杂 | Sidebar with 10+ flat items, pages with 5+ tabs, modals nested in modals | No progressive disclosure; everything visible at all times |
| P3 | 有些功能不是必要 | ~20–30 % of features are likely rarely used but always visible | No usage data; feature audit never performed |

These three together cause one user feeling: **"I don't know where to start, and I'm overwhelmed."**

> **❗ Open question for Boss**: of P1 / P2 / P3, which is most important to address first? (My recommendation: P1, because it's a 1-week visual hierarchy fix, not a feature-deprecation political minefield.)

## 4. Users & Jobs To Be Done

Per director affirmation, the 4-portal architecture is preserved. Each portal has its own persona and its own primary job:

| Portal | Persona | THE one job (proposed — needs director confirmation) | Daily usage |
|---|---|---|---|
| **Production** | Studio admin / boss | *"See what's blocking today and unblock it."* | Multiple times daily |
| **Client** | Brand / agency contact | *"Check my project and approve what needs approving."* | Weekly bursts |
| **Talent** | Cast, model, actor | *"Accept bookings, read call sheets, get paid."* | On demand, mobile |
| **Crew** | DOP, gaffer, AC, runner, etc. | *"Accept assignments, read call sheets, get reimbursed."* | On demand, mobile |

The "THE one job" is the single most important sentence in this PRD — it determines what each portal's landing screen looks like.

> **❗ Open question for Boss**: are these 4 sentences correct? If not, what's the real one-sentence job for each?

## 5. Goals & Non-Goals

**Goals (v1 ship target Q3 2026)**

- 🎯 **NEW North Star** — *3-second comprehension*: an outsider who has never seen the system can correctly state what each portal is for within 3 seconds of opening it.
- 🔪 **Subtract** — identify and deprecate / progressively-hide **≥ 20 %** of features (by count of sidebar items + tabs + buttons).
- ⚡ **Compress** — top-10 highest-frequency tasks have an avg path length of **≤ 3 clicks** (down from estimated 5–7).
- 🎨 **Hierarchy** — every main screen has **1 primary action + ≤ 3 secondary actions** above the fold.
- 🧭 **Preserve** — 4-portal structure (Production · Client · Talent · Crew) stays exactly as today.
- 📱 Talent + Crew portals usable on phone, on-set.
- 🛠 Boss can demo the system to a new client without explaining where things are.

**Non-Goals (explicit, v1 will NOT do)**

- ❌ Merge or rename portals (director explicitly vetoed)
- ❌ Backend / data-model changes
- ❌ New functional modules
- ❌ Delete features outright without director sign-off (hide first, delete later)
- ❌ Native iOS / Android app (PWA only if scope allows)
- ❌ Multi-tenant, i18n, realtime co-edit

## 6. Success Metrics

| Tier | Metric | Baseline | Target (v1) | Measurement |
|---|---|---|---|---|
| **North Star** | 3-second comprehension test pass rate (outsider correctly guesses portal purpose) | ~30 % (v1 colorful cards) | **≥ 90 %** | Show 3 outsiders the login + dashboard; ask "what is this for?" |
| Subtract | Visible feature count per portal | TBD (audit pending) | **−20 %** | Sidebar items + visible buttons + tabs |
| Compress | Avg clicks on top-10 tasks | 5.5 (estimated) | **≤ 3.0** | Manual flow walkthrough |
| Quality | Lighthouse mobile (Talent/Crew) | unknown | ≥ 90 | Lighthouse |
| Quality | Feature regression count | n/a | **0** | Test matrix vs v1 |
| Adoption | Director "would recommend" score | n/a | ≥ 9 / 10 | Direct ask |
| Adoption | Talent/Crew weekly logins | unknown | +50 % within 4 weeks of launch | Auth logs |

> **❗ Open question for Boss**: are the targets realistic, especially −20 % feature deprecation? Need to align on tolerance.

## 7. Solution Overview — Design Philosophy

Four principles, in priority order:

1. **Subtract before you add.** Every Sprint reviews what to remove before what to build. If we can't justify a feature, it goes behind progressive disclosure first (collapsed by default), then a future Sprint deletes it.

2. **Each portal screams its purpose.** First-time visitor knows in 3 seconds what this portal is for. Implementation: each portal's landing page leads with one declarative headline ("Manage today's productions" / "Review and approve" / "Your next booking" / "Your next assignment") rather than a generic "Dashboard" title.

3. **Status Board, not Action Center.** The director's approved Dashboard demo organises chronologically and by domain — Active Projects table + Activity Feed. We follow that mental model across all 4 portals (each has a Board appropriate to its job).

4. **Brand carries through everything.** Visual tokens (`#D8FF00` brand, `#000` ink, League Gothic display) live in CSS variables. New components consume tokens, not local hex.

> See Appendix C for the exhaustive component / token inventory.

## 11. Milestones (next 6 weeks)

The compressed plan. Detailed scope per sprint mirrors §1 timeline table.

| Sprint | Dates | Demo / Gate |
|---|---|---|
| **Sprint 0** ✅ | 5/20 → 5/28 | Live at https://jerry6063.github.io/HXVP-v2-demo/ |
| **Sprint 0.5** | 5/29 → 6/4 | **End-of-week gate**: director signs §12 user flows. No code past this point without sign-off. |
| **Sprint 1 — 6/15 Milestone** | 6/5 → 6/15 | **Live demo to director on 6/15**: all 4 portals reveal "the one job" within 3 seconds; ⌘K works; Tier-3 features collapsed. |
| **Sprint 2 — 7/6 Launch** | 6/16 → 7/6 | **Production rollout to real users on 7/6** (or earliest weekday). Top user flows in §12 work end-to-end. |
| Post-launch (v1.5) | 7/7+ | Deep detail page rollout · Shoot Command Center · Cascade prompts · Bulk ops |

**Implication**: the existing Phase 2 / 3 / 4 / 5 spec in §8 is now **partially post-launch (v1.5+)**. v1 ships with:

- 4 redesigned portal landing pages (the first screen each persona sees)
- ⌘K search
- The visual system applied to all routable pages' shells (sidebar + header)
- Deep detail pages may retain v1 visual styling internally — acceptable because primary persona's main flows don't visit them daily

This is honest about scope. Director should know what will and won't be polished by launch.

---

# Part II — Detailed Specification (for Engineers)

## 8. Phased Requirements

### Phase 0 — Visual Baseline ✅ DONE

| Item | Status | Location |
|---|---|---|
| Brand CSS tokens (`--color-brand` etc.) | ✅ | `frontend/src/index.css` |
| `Button` / `Input` / `Card` primitives | ✅ | `frontend/src/components/ui/` |
| `StatCard` / `StatusBadge` / `LoadingSpinner` restyled | ✅ | `frontend/src/components/` |
| `PortalLayout` dark + grouped sidebar | ✅ | `frontend/src/components/PortalLayout.jsx` |
| `HomePage` skewed portal grid | ✅ (but currently shows 3 — needs revert to 4) | `frontend/src/components/HomePage.jsx` |
| `LoginPage` Apple-style entry transition | ✅ | `frontend/src/components/LoginPage.jsx` + `portalTransition.js` |
| Production Dashboard Status Board | ✅ | `frontend/src/portals/production/Dashboard.jsx` |
| Mock auth (no backend required) | ✅ | `frontend/src/contexts/AuthContext.jsx` |

### Phase 0.5 — Course-correction (Sprint 0.5) 🆕

| Item | Spec | Acceptance |
|---|---|---|
| **Revert Model merge — HomePage** | 3 portal cards → 4 (add Crew back); grid `lg:grid-cols-3` → `lg:grid-cols-4`; "3 Portals" → "4 Roles" | `/` shows 4 cards; Crew card animates to `/crew/login` with same Apple-style transition |
| **Revert Model merge — LoginPage** | `portalMeta.talent.title` → "Talent"; `portalMeta.crew.title` → "Crew"; restore separate subtitles | Crew login page shows "CREW" hero, not "MODEL" |
| **Revert sidebar copy** | `PortalLayout` `portalConfigs.talent.title` → "Talent"; `portalConfigs.crew.title` → "Crew"; PORTALS section in production sidebar lists "Client Portal · Talent Portal · Crew Portal" (3 cross-links) | Production admin can jump to all 3 other portals from sidebar |
| **Feature audit doc** | Walk each portal's sidebar + each page's tabs + each modal with director; tag each as Essential / Secondary / Deprecate. Output: `docs/feature-audit.md` | Director signs off on the tags |
| **Portal purpose sentences** | One declarative sentence per portal, written by director (or proposed by Jerry and confirmed). | Sentence visible in `docs/PRD.md §4` and rendered as login-page subtitle in code |

### Phase 1 — Highlight What Matters (Sprint 1)

| Item | Spec | Acceptance |
|---|---|---|
| **Portal landing page hierarchy** | Each portal's landing replaces generic "Dashboard" header with: (a) one declarative sentence (the portal's purpose), (b) the one primary CTA / panel, (c) at most 3 secondary panels. Tier-3 (deprecate) features hidden behind a "More" toggle or moved to a Settings page. | 3-second comprehension test passes ≥ 90 % with 3 outsiders |
| **Sidebar consolidation** | Each section max 5 items visible; Tier-3 items moved to a collapsed "Advanced" subsection or removed | Sidebar visible item count per portal − 20 % |
| **⌘K Global Search** | Portal at top-right of every layout; opens overlay; fuzzy matches projects / talent / crew / contracts / invoices / shoots; arrow + Enter navigates | TTI ≤ 200 ms; ≤ 2 keystrokes from any page |

### Phase 2 — Workflow Compression (Sprint 2)

| Item | Spec | Acceptance |
|---|---|---|
| **Shoot Command Center** | Single `/production/shoots/:id` page consolidating shoot meta, talent bookings, crew assignments, call sheet generator, production logs, comments. No nested modal trees. | Editing shoot date in this page updates dependents (see cascade) |
| **Cascade Prompts** | Changing a shoot date triggers "*This will affect N bookings + M assignments. Notify everyone?* [Yes / Just this one]" | One click cascade vs current manual 10+ updates |
| **Bulk Actions on Bookings** | Multi-select rows + bulk: confirm / decline / re-send call sheet / mark paid | 10× speedup on month-end ops |
| **Activity Feed → real data** | Replace mock array with API hook; group by day; mobile-friendly | Same data on Dashboard as the events that actually happened |

### Phase 3 — Visual Rollout (Sprints 3–5)

Pages still on v1 visual (≈ 50). Roll out in priority order:

| Page Group | Pages | Sprint |
|---|---|---|
| Production deep | Projects (list + detail), Talent module, Crew page, Invoices | 3 |
| Client | Dashboard, Production timeline, Deliverable center, Talent roster, Invoices | 4 |
| Talent | Profile, Bookings, Calendar, Records, Payments, Documents | 5 |
| Crew | Profile, Assignments, Calendar, Records, Payments, Documents, Reimbursements | 5 |

Each rolled-out page must:

- Consume only `src/components/ui/*` and the design tokens
- Use `StatusBadge`, `StatCard`, `LoadingSpinner` (already styled)
- Match Dashboard's dark + bordered + League-Gothic-headings pattern
- Visible action count ≤ 4 per main screen

## 9. Information Architecture (4 portals restored)

```
HXVP Studio v2
│
├── /  (Public landing — 4 portal cards)
│      Production · Client · Talent · Crew
│
├── /production  (role: production_admin)
│   ├── /dashboard         Status Board (Stats + Active Projects + Activity Feed)
│   ├── /projects[*]       Productions Module
│   ├── /calendar          Shoot Day Tracker
│   ├── /talent[*]         Models & Talent
│   ├── /crew[*]           Production Crew
│   ├── /documents         Documents (call sheets / contracts / checklists / budgets)
│   ├── /invoices[*]       Client Payments
│   ├── /talent-payments   Payroll (Talent + Crew + Time Logs)
│   ├── /revenue           Revenue & Expenses
│   └── /messages
│
├── /client  (role: client)
│   ├── /dashboard, /request, /production, /deliverables,
│   ├── /payments, /talent, /messages
│
├── /talent  (role: talent)
│   ├── /dashboard, /profile, /bookings, /calendar,
│   ├── /records, /payments, /documents
│
└── /crew  (role: crew)
    ├── /dashboard, /profile, /calendar, /assignments,
    ├── /records, /payments, /reimbursements, /documents
```

Sidebar grouping (consistent across all 4 portals):

```
OVERVIEW   → Dashboard · Quick action
WORK       → Work-related nav items with item-count badges (max 5 visible)
PORTALS    → Cross-portal links (production admin → other 3 portals)
FINANCE    → Payments, invoices, payroll (where applicable)
```

## 10. Out of Scope (v1)

- Portal merging or renaming (director vetoed)
- Outright feature deletion without director sign-off (hide first, delete in v1.5)
- Backend / API / data-model changes
- New features (AI, smart scheduling, etc.)
- Native mobile apps
- Multi-tenant, i18n, realtime co-edit
- Public marketing site (lives at hxvp.us, not in this scope)

## 11. Risks & Open Questions

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Director's intuition about "non-essential" features ≠ actual user usage data | M | M | Sprint 0.5 audit captures director's tagging; instrument deprecated features for 4 weeks before deleting in v1.5 |
| R2 | "3-second comprehension" target is qualitative and subjective | M | L | Run test with 3 outsiders per portal; document with screen recordings |
| R3 | Sidebar consolidation may hide a feature the boss actually uses daily | M | M | Each "hide" needs director acknowledgment in Sprint 0.5 audit |
| R4 | Visual rollout to 50 pages within Sprints 3–5 may slip | H | L | Tagged pages can defer to v1.5 without blocking launch |
| R5 | Public demo URL may leak competitive info | L | L | Demo data is fake; legacy backend isolated to `backend.legacy/`; license MIT is intentional |

**Open Questions awaiting Director / Stakeholder decisions**

**Highest priority — blocks Sprint 1 build:**

- **Q1** — §12 flow inventory: for each of the 25 flows F-P / F-C / F-T / F-X, mark ✓ correct · ⚠ partial · ✗ wrong. Add missing flows we forgot. **Sign-off needed by Wed 6/4.**
- **Q2** — §4 portal one-sentence jobs: confirm or rewrite each of the 4 proposed sentences. These literally become the headline copy on each portal's landing page.

**Medium priority — needed for Sprint 0.5 audit session:**

- **Q3** — §3 — of the three pains (P1 lacks focus / P2 looks complex / P3 unnecessary features), which is **#1** to address first?
- **Q4** — §5 — accept the −20 % feature count target, or prefer aggressive (−40 %) / conservative (−10 %)?
- **Q5** — §7 — can we schedule a 90-minute session with director to walk through every sidebar item and tag each Essential / Secondary / Deprecate? Proposed date: 6/2 or 6/3.

**Tactical:**

- **Q6** — at 7/6 launch, is mock mode acceptable as a starting state for new users, or must real backend be hooked up day 1?
- **Q7** — Model-merge revert public demo: re-deploy URL the same day as revert (auto via Actions), or wait?

---

## 12. User Flows (the section the director should read most carefully)

> **❗ Director sign-off needed by 6/4.** For each flow below, please mark: **✓ correct as written** · **⚠ partially correct (note what's off)** · **✗ wrong or missing (note replacement)**. The flows you confirm here drive all Sprint 1–2 design and build. **No further engineering past this point happens without confirmation.**

### How to read the tables

| Column | What it means |
|---|---|
| **ID** | Stable reference, used in Sprint plans, audit, and tests |
| **Flow** | One-sentence user story: "Persona does X so Y" |
| **Trigger** | What initiates this flow today |
| **Today (v1)** | Approx clicks / pages traversed in current production system |
| **v2 Target** | Click goal in redesigned system |
| **Freq** | How often persona performs this — D(aily) / W(eekly) / M(onthly) |

### 12.1 Production Portal flows (Studio Admin)

Persona's one-sentence job: *"See what's blocking today and unblock it."*

| ID | Flow | Trigger | Today | v2 Target | Freq |
|---|---|---|---|---|---|
| **F-P-01** | Glance at what's blocked or needs me right now | Login | 5+ scroll across Dashboard panels | 2 (Status Board surfaces above the fold) | D |
| **F-P-02** | Convert a new client request into a project | New `Project Request` arrives | 6: Requests → open → "Create Project" → fill → save → confirm | 3 (one-click promote) | W |
| **F-P-03** | Plan a new shoot (date · location · requirements) | Project needs shoot | 5: Project detail → Shoots tab → "New Shoot" → fill modal → save | 3 (inline within Project) | W |
| **F-P-04** | Build a talent shortlist + send availability inquiries | Shoot needs talent | 8+: Talent module → filter → multi-select → "Send Inquiry" modal → fill → confirm | 4 (inline shortlist drawer on Shoot page) | W |
| **F-P-05** | Build crew assignment + send availability inquiries | Shoot needs crew | 8+: Crew page → similar to F-P-04 | 4 (mirror of F-P-04) | W |
| **F-P-06** | Send call sheet to confirmed people for tomorrow's shoot | Day before shoot | 7: Shoot → Call sheets tab → "New" → fill / pre-fill → preview → send | 3 (one-click generate from confirmed bookings + assignments) | W |
| **F-P-07** | Approve time logs at month end | Month-end | 10+ per person (open each log → review → approve) | 3 (bulk approve view, deferred to v1.5 — partial in v1) | M |
| **F-P-08** | Issue invoice to client | Project milestone reached | 6: Invoices → "New" → select project → line items → preview → send | 3 (one-click from Project / milestone) | W |
| **F-P-09** | Mark invoice as paid + record payment | Client paid | 4: Invoice → "Mark paid" → confirm → record | 2 | W |
| **F-P-10** | Move a shoot to a different date and notify everyone | Schedule change | 12+ (edit shoot + manually notify each person) | 3 (cascade prompt — partial in v1, full in v1.5) | W |

### 12.2 Client Portal flows

Persona's one-sentence job: *"Check my project and approve what needs approving."*

| ID | Flow | Trigger | Today | v2 Target | Freq |
|---|---|---|---|---|---|
| **F-C-01** | Submit a new project request | Need shoot | 5: Login → New Request → fill → upload refs → submit | 3 | M |
| **F-C-02** | Check progress of my active project | Curious / due-date approaching | 4: Login → Production → my project → scroll | 2 (Dashboard surfaces it) | W |
| **F-C-03** | Review and approve deliverables | Deliverables ready | 6: Login → Deliverables → open shoot folder → review each → approve each | 3 (inline approve, grid view) | W |
| **F-C-04** | Sign a contract | Contract sent | 5: Login → Notifications → contract → review → sign | 3 | M |
| **F-C-05** | Pay an invoice | Invoice received | 4: Login → Payments → invoice → pay | 3 | M |

### 12.3 Talent Portal flows (Model · Actor · Cast)

Persona's one-sentence job: *"Accept bookings, read call sheets, get paid."*

| ID | Flow | Trigger | Today | v2 Target | Freq |
|---|---|---|---|---|---|
| **F-T-01** | Respond to availability inquiry (Accept / Decline) | Inquiry pushed | 4 (web): Login → Bookings → inquiry → respond. On mobile: even more | **1 tap** (mobile-first home card with inline Accept / Decline) | W |
| **F-T-02** | Read tomorrow's call sheet (location · time · wardrobe) | Day before shoot | 4: Login → Bookings → upcoming → call sheet | 1 (home shows next call sheet at top) | W |
| **F-T-03** | Update profile / availability calendar | Schedule change | 6: Profile → calendar → click date → mark → save | 3 | M |
| **F-T-04** | Submit time log after a shoot | Wrap | 5: Login → Records → log → fill → submit | 2 (one-tap from shoot detail) | W |
| **F-T-05** | Check earnings / payment status | Payday curiosity | 3: Login → Payments → view | 2 (home shows next payout) | W |

### 12.4 Crew Portal flows (DP · Gaffer · AC · Runner etc.)

Persona's one-sentence job: *"Accept assignments, read call sheets, get reimbursed."*

| ID | Flow | Trigger | Today | v2 Target | Freq |
|---|---|---|---|---|---|
| **F-X-01** | Respond to availability inquiry | Inquiry pushed | 4 (web), worse on mobile | **1 tap** mobile | W |
| **F-X-02** | Read tomorrow's call sheet | Day before shoot | 4 | 1 | W |
| **F-X-03** | Submit time log after a shoot | Wrap | 5 | 2 | W |
| **F-X-04** | Submit a reimbursement (gas · meals · gear rental) | Expense incurred | 6: Reimbursements → New → fill → upload receipt → save → submit | 3 (mobile-friendly photo upload) | W |
| **F-X-05** | Check earnings / payment status | Payday curiosity | 3 | 2 | W |

> **Notes for director review**
> - Frequencies (D/W/M) are best-guesses — please correct any that feel wrong.
> - "Today" click counts are estimates; actual numbers will be measured during Sprint 0.5 audit.
> - Many "v2 Target = 1 tap" flows for Talent / Crew depend on the **mobile-first home redesign** in Sprint 2.

## 13. Workflows (multi-step processes spanning multiple sessions or personas)

These are end-to-end business processes that string the §12 flows together. v2 doesn't change the workflow shapes — only how smoothly each step connects.

### W-1 · Project Lifecycle (Client request → invoice paid)

```
Client                Production                              Talent/Crew
──────                ──────────                              ──────────
F-C-01  ───→  F-P-02 promote to project
                │
                ├─→  F-P-03  plan shoots
                ├─→  F-P-04  shortlist talent  ───────→  F-T-01 respond
                ├─→  F-P-05  shortlist crew   ───────→  F-X-01 respond
                │
                ├─→  F-P-06  send call sheets ──────→  F-T-02 read / F-X-02 read
                │
                │     [SHOOT DAY happens off-system]
                │
                ├─→  F-P-07  approve time logs ←─── F-T-04 submit / F-X-03 submit
                ├─→ deliverables uploaded ────────→  F-C-03 review/approve
                │
                ├─→  F-P-08  issue invoice ─────────→  F-C-05 pay
                └─→  F-P-09  record payment
```

**v2 stress points** (where boss reported most friction):
- F-P-04 / F-P-05 (shortlist + inquiries) — currently 8+ clicks each, the most expensive step
- F-P-06 (call sheets) — should auto-fill from confirmed bookings, not require re-typing
- F-P-10 (date change) — currently zero cascade, manual re-notify chain

### W-2 · Shoot Day Lifecycle (Plan → wrap → settle)

```
T-7 days   F-P-03 plan shoot
T-5 days   F-P-04 shortlist talent
T-5 days   F-P-05 shortlist crew
T-2 days   ⏳ Final confirmations received
T-1 day    F-P-06 send call sheets  ─→  F-T-02 / F-X-02 read & confirm
T-0        SHOOT DAY                  (out of system)
T+0 evening F-T-04 / F-X-03 submit time logs
T+1 day    F-P-07 approve time logs
```

**v2 simplification**: the entire shoot day flow ideally collapses into a single Shoot Command Center page (planned v1.5) — but for launch, T-7 → T+1 should at least feel like a coherent vertical narrative inside the Project page, not 7 disconnected pages.

### W-3 · Talent / Crew Onboarding

```
F-P  invite (Production sends invite link)
  ↓
F-T-03 / F-X (new model fills profile, calendar, uploads photos)
  ↓
F-P  approves profile (Talent Admin)
  ↓
Eligible for F-P-04 / F-P-05 shortlists
```

**v2**: profile completeness % progress bar on home so models know what's left.

### W-4 · Month-end Payroll

```
1st of month  F-P-07 admin reviews all time logs of prior month
              ↓
              bulk approve where possible (v1.5 capability)
              ↓
              talent/crew payments queued
              ↓
              F-T-05 / F-X-05 see "paid" status update
```

**v2 stress point**: 30+ time logs per month per studio is currently 30 × ~5 clicks = 150+ clicks. Bulk operations (v1.5) are critical here, but partial bulk in v1 acceptable.

---

# Appendix A — Glossary

| Term | Definition |
|---|---|
| **Portal** | One of four top-level role-based UI shells: Production, Client, Talent, Crew |
| **Shoot** | A single day of filming/photographing, belongs to a Project |
| **Call Sheet** | Document sent to talent + crew the day before a shoot with location, call time, wardrobe |
| **Booking** | A talent's confirmed participation in a Shoot |
| **Assignment** | A crew member's confirmed participation in a Shoot |
| **Time Log** | Hourly record submitted by talent/crew for payment |
| **Feature tag** | Essential (always-visible) · Secondary (one-click reveal) · Deprecate (hidden / removed) |
| **DRI** | Directly Responsible Individual (Apple PM convention) |
| **3-second comprehension** | Outsider correctly states portal purpose within 3 seconds of opening |

# Appendix B — References

- **Public brand site (visual reference)**: https://hxvp.us/
- **SetHero (functional reference for call-sheet workflow)**: https://sethero.com/
- **Director-approved Dashboard demo screenshot**: see Sprint 0 commit `ad6ad68`
- **Director feedback screenshot (2026-05-28, v1 main 4-portal grid)**: attached to chat
- **Original engineer's deploy (legacy v1)**: https://hxvp-studio-frontend.onrender.com/production
- **v2 public demo**: https://jerry6063.github.io/HXVP-v2-demo/

# Appendix C — Component & Token Inventory

### Design tokens (CSS variables, defined in `frontend/src/index.css`)

```
--color-brand        #D8FF00   electric lime (primary CTA / accent)
--color-brand-hover  #C2E600
--color-accent-2     #F0523D   coral (secondary / warning)

--color-ink          #000000   primary text
--color-ink-soft     #272727
--color-ink-muted    #737373
--color-ink-subtle   #A9A9A9

--color-paper        #FFFFFF
--color-paper-soft   #FAFAFA
--color-paper-dark   #0A0A0A   main app background
--color-rule         #E7E7E7

--font-display       "League Gothic"  (uppercase, condensed, large)
--font-sans          "Helvetica Neue" / Helvetica / Arial

--radius-card        2px       (editorial — almost no rounding)
```

### UI primitives (`frontend/src/components/ui/`)

| Component | Variants | Sizes |
|---|---|---|
| `Button` | primary · secondary · ghost · danger | sm · md · lg |
| `Input` | input · textarea · select (via `as` prop) | — |
| `Card` | default · paper · emphasis (+ `Card.Header` / `.Body` / `.Footer`) | — |

### Stateful components (preserve existing API, restyled)

| Component | Note |
|---|---|
| `StatCard` | `color` prop accepts legacy `indigo/emerald/amber/sky` for back-compat, all map to brand yellow |
| `StatusBadge` | 40+ legacy statuses bucketed into 5 semantic tones (success · warning · info · danger · neutral) tuned for light backgrounds |
| `LoadingSpinner` | Yellow ring on dark backgrounds |

### Transition utilities

`frontend/src/components/portalTransition.js` — shared `motion` config:
- `PORTAL_TRANSITION` — 800 ms ease-in-out-quart for layoutId-driven cross-page morph
- `portalLayoutId(key)` — naming factory keeping HomePage and LoginPage in sync

# Appendix D — Proposed Top-10 Tasks (for click-count + comprehension baselines)

1. View today's pending bookings (Production admin)
2. Send a call sheet for tomorrow's shoot
3. Approve a Time Log
4. Issue an invoice
5. Mark an invoice paid
6. Move a shoot to a different date (incl. notifications)
7. Add a new model to the roster
8. Client approves a deliverable
9. Client signs a contract
10. Talent / Crew accepts a booking on mobile

# Appendix E — File Inventory & LOC

(Generated 2026-05-28 from `v2-redesign` branch.)

| Group | Files | LOC |
|---|---|---|
| Total `frontend/src/**/*.jsx` | 74 | 26 712 |
| `portals/production/**` | 27 | 13 350 |
| `portals/client/**` | 7 | 2 320 |
| `portals/talent/**` | 8 | 2 985 |
| `portals/crew/**` | 8 | 2 690 |
| `components/**` (shared) | 17 | 2 900 |
| `api/**` (hooks + client) | 2 | 1 950 |

> Pages over 500 LOC ("heavy detail pages") are listed in `appendix-e-detail.md` (TBD) — these are high-priority Sprint 3 targets.

# Appendix F 🆕 — Feature Audit Framework

The Sprint 0.5 audit answers the question: *for every feature in the system, is it Essential, Secondary, or Deprecate?*

### Tagging rubric

| Tag | Criteria | UI implication |
|---|---|---|
| **🟢 Essential** | (a) Used ≥ once per day by primary persona, OR (b) blocks a core workflow if missing | Always visible, top of sidebar / page hierarchy |
| **🟡 Secondary** | (a) Used 1–4× per month, OR (b) used by a small subset of users daily, OR (c) supporting/admin function | Hidden behind one click (e.g. "Advanced" section, settings menu, contextual modal) |
| **🔴 Deprecate** | (a) Used < 1×/month by anyone, OR (b) overlaps with another feature that's better, OR (c) director explicitly says "I never use this" | Removed from sidebar in v1; soft-hidden in code (kept routable for transition); deleted in v1.5 |

### Audit process (Sprint 0.5)

1. **Inventory** (Jerry, 1 day before director meeting): generate a flat list of every sidebar item, every page tab, every modal action across the 4 portals. Format: `docs/feature-audit.md` with rows = features, columns = [Portal · Path · Description · Tag · Director note].
2. **Walkthrough** (Director + Jerry, 90 min session): step through the list, director tags each row. Where unclear, log in "Director note" column for follow-up.
3. **Decision** (Jerry, same day): close the list, commit `docs/feature-audit.md`.
4. **Apply** (Sprint 1): UI changes per the rubric above. No feature is *deleted* in Sprint 1 — only hidden / collapsed.
5. **Instrument** (Sprint 1 onward): add usage analytics on deprecated features. If anything unexpectedly used > 1×/month for 4 weeks, promote it back to Secondary.
6. **Delete** (v1.5, post-launch): items still cold after 4 weeks of instrumentation get deleted from code.

### Example audit row format

```
| Portal     | Path                       | Feature                  | Tag          | Note                                  |
|------------|----------------------------|--------------------------|--------------|---------------------------------------|
| Production | /production/messages       | In-app messaging         | 🟡 Secondary | "Most ppl use WeChat, but useful log" |
| Production | /production/revenue        | Revenue analysis charts  | 🟢 Essential | "I look at this every Monday"         |
| Production | /production/talent-payments| Stripe payout integration| 🟡 Secondary | "Used 2-3x/month at month-end"        |
| Client     | /client/talent             | Talent roster sharing    | 🔴 Deprecate | "Client never logs in to see this"    |
```

---

## Change log

| Version | Date | Author | Notes |
|---|---|---|---|
| 0.1 | 2026-05-28 | Jerry Zheng | Initial draft post-Sprint 0; assumed Talent+Crew merge into Model |
| 0.2 | 2026-05-28 | Jerry Zheng | **Director feedback received.** Reverted Model merge (4 portals stay). Reframed problem from "too many clicks" to "lacks focus + complex + feature bloat." Added Phase 0.5 (Feature Audit). New North Star: 3-second comprehension. |
| 0.3 | 2026-05-28 | Jerry Zheng | **Deadlines locked: 6/15 internal + early-July launch.** Compressed roadmap from 6 sprints to 2 + 0.5 prep. Added §12 User Flow inventory (25 flows across 4 portals) and §13 Workflow diagrams — **the single most important deliverable this week; blocks all Sprint 1 build until director signs off.** Open Questions Q1 / Q2 reordered to flow validation. |

---

> **Next action (boss)**: read §1 → §12 (the flows tables) → §11. Mark each flow ✓ ⚠ ✗ by 6/4. Once §12 lands and Q1–Q5 are answered, Sprint 0.5 spec freezes and Sprint 1 build begins 6/5.
