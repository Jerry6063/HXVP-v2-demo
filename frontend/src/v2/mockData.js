/** Static mock data for the v2 preview screens (from the designer's PNGs). */

export const TALENTS = [
  {
    id: "andre",
    name: "Andre Miller",
    role: "Actor",
    city: "Pasadena",
    rate: 120,
    tagline: "Lifestyle campaigns, founder scenes",
    age: 40,
    height: "5ft 10in – 6ft 3in",
    gender: "Man",
    ethnicity: "White",
    img: 12,
  },
  {
    id: "sofia",
    name: "Sofia Lin",
    role: "Actor",
    city: "Toronto",
    rate: 130,
    tagline: "TV shows, films",
    age: 32,
    height: "5ft 4in – 5ft 9in",
    gender: "Woman",
    ethnicity: "Mixed",
    img: 5,
  },
  {
    id: "liumei",
    name: "Liu Mei",
    role: "Hand Model",
    city: "Los Angeles",
    rate: 180,
    tagline: "Product photography, commercials",
    age: 32,
    height: "5ft 6in",
    gender: "Woman",
    ethnicity: "Asian",
    img: 9,
  },
  {
    id: "maya",
    name: "Maya Patel",
    role: "Dancer",
    city: "London",
    rate: 140,
    tagline: "Commercials, live performances",
    age: 28,
    height: "5ft 4in – 5ft 7in",
    gender: "Woman",
    ethnicity: "Indian",
    img: 31,
  },
  {
    id: "david",
    name: "David Smith",
    role: "Model",
    city: "New York",
    rate: 150,
    tagline: "Editorial, runway",
    age: 27,
    height: "6ft 0in",
    gender: "Man",
    ethnicity: "White",
    img: 13,
  },
  {
    id: "john",
    name: "John Doe",
    role: "Actor",
    city: "Chicago",
    rate: 150,
    tagline: "Drama, voiceover",
    age: 35,
    height: "5ft 11in",
    gender: "Man",
    ethnicity: "Black",
    img: 33,
  },
  {
    id: "alex",
    name: "Alex Johnson",
    role: "Model",
    city: "Miami",
    rate: 150,
    tagline: "Fashion, lifestyle",
    age: 29,
    height: "6ft 1in",
    gender: "Man",
    ethnicity: "Black",
    img: 51,
  },
  {
    id: "mike",
    name: "Mike Brown",
    role: "Actor",
    city: "Austin",
    rate: 150,
    tagline: "Commercials, indie film",
    age: 41,
    height: "5ft 10in",
    gender: "Man",
    ethnicity: "White",
    img: 60,
  },
  {
    id: "emma",
    name: "Emma Watson",
    role: "Model",
    city: "Seattle",
    rate: 150,
    tagline: "Beauty, editorial",
    age: 26,
    height: "5ft 7in",
    gender: "Woman",
    ethnicity: "White",
    img: 45,
  },
  {
    id: "sam",
    name: "Sam Lee",
    role: "Actor",
    city: "San Francisco",
    rate: 175,
    tagline: "Tech ads, narrative",
    age: 34,
    height: "5ft 9in",
    gender: "Man",
    ethnicity: "Asian",
    img: 15,
  },
];

export const SHORTLIST_IDS = ["andre", "sofia", "liumei", "maya"];

/** Client-side recipients for the "Share with Client" send panel. */
export const CLIENT_RECIPIENTS = [
  { id: "c1", name: "Kaleb Jensen", img: 12 },
  { id: "c2", name: "Tim Wang", img: 33 },
];

export const PROJECTS = [
  {
    name: "Spring Lifestyle Collection",
    desc: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    date: "June 6, 2026",
    status: "Pre-production",
    progress: 20,
  },
  {
    name: "E-Bike Launch Campaign",
    desc: "Video + Photo — Social Media",
    client: "Troxus Mobility",
    date: "May 22, 2026",
    status: "Production",
    progress: 55,
  },
  {
    name: "Smart Home Product Reveal",
    desc: "Commercial Video — 60s + 15s",
    client: "GE Consumer",
    date: "Feb 22, 2026",
    status: "Post-production",
    progress: 78,
  },
  {
    name: "Q1 Snack Campaign",
    desc: "Lifestyle Photography — 8 setups",
    client: "Provision Furniture",
    date: "Feb 22, 2026",
    status: "Client Review",
    progress: 90,
  },
  {
    name: "Brand Lifestyle Series",
    desc: "Model Portfolio — 12 looks",
    client: "Provision Furniture",
    date: "Feb 22, 2026",
    status: "Pre-production",
    progress: 15,
  },
  {
    name: "Spring Lifestyle Collection",
    desc: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    date: "Feb 22, 2026",
    status: "Production",
    progress: 48,
  },
  {
    name: "E-Bike Launch Campaign",
    desc: "Video + Photo — Social Media",
    client: "Troxus Mobility",
    date: "Feb 22, 2026",
    status: "Pre-production",
    progress: 12,
  },
  {
    name: "Smart Home Product Reveal",
    desc: "Commercial Video — 60s + 15s",
    client: "GE Consumer",
    date: "Feb 22, 2026",
    status: "Pre-production",
    progress: 18,
  },
];

export const STATUS_STYLES = {
  "Pre-production": "border-emerald-300 text-emerald-700 bg-emerald-50",
  Production: "border-amber-300 text-amber-700 bg-amber-50",
  "Post-production": "border-orange-300 text-orange-700 bg-orange-50",
  "Client Review": "border-rose-300 text-rose-700 bg-rose-50",
};

export const TASKS = [
  { text: "Confirmed availability for Povison shoot", due: "Due today" },
  { text: "Review monthly time log", due: "Due today" },
  { text: "Send out call sheet for Povison shoot — Feb 22", due: "Due tomorrow" },
  { text: "Send model shortlist to client", due: "Due 06/10/2026" },
  { text: "Updated portfolio photos", due: "Due 06/14/2026" },
  { text: "Confirm availability for Povison shoot", due: "Due 06/24/2026" },
  {
    text: "Coordinate with Troxus Mobility signed production agreement",
    due: "Due 06/30/2026",
  },
  {
    text: "Confirmed availability of crew for GE consumer project",
    due: "Due 07/04/2026",
  },
  { text: "PepsiCo approved 6 of 8 final images", due: "Due 07/06/2026" },
];

export const CLIENTS = [
  "Provision Furniture",
  "Troxus Mobility",
  "GE Consumer",
  "PepsiCo",
];

/** Inbox messages for the Messages screens. tag ∈ "Replied" | "Pending" | "Important" */
const REPLY_TO = "alicesmith@yourmail.com";

export const CLIENT_MESSAGES = [
  {
    id: "c1",
    sender: "Michael Wilson",
    subject: "Important Announcement",
    preview:
      "I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach for the upcoming project...",
    time: "10:42 AM",
    tag: "Important",
    body: "Hi, I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach for the upcoming project.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards,\nMichael Wilson",
  },
  {
    id: "c2",
    sender: "William Smith",
    subject: "Meeting Tomorrow",
    preview:
      "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share...",
    time: "Jun 15, 2026 9:30 AM",
    tag: "Replied",
    body: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards,\nWilliam Smith",
  },
  {
    id: "c3",
    sender: "Alice Smith",
    subject: "Re: Project Update",
    preview:
      "Thank you for the project update. It looks great! I've gone through the report and the progress is impressive...",
    time: "Jun 14, 2026",
    tag: "Replied",
    body: "Thank you for the project update. It looks great! I've gone through the report and the progress is impressive. We are on track to hit every milestone for this quarter.\n\nLet me know if there is anything you need from my side.\n\nBest,\nAlice Smith",
  },
  {
    id: "c4",
    sender: "Bob Johnson",
    subject: "Weekend Plans",
    preview:
      "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we've...",
    time: "Jun 13, 2026",
    tag: "Pending",
    body: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we've taken a break, and a change of scenery would do us good.\n\nLet me know if you're interested!\n\nBob",
  },
  {
    id: "c5",
    sender: "Emily Davis",
    subject: "Re: Question about Budget",
    preview:
      "I have a question about the budget for the upcoming project. There seems to be a discrepancy in the allocation of resources...",
    time: "Jun 12, 2026",
    tag: "Pending",
    body: "I have a question about the budget for the upcoming project. There seems to be a discrepancy in the allocation of resources for the production phase.\n\nCould we set up a quick call to clarify the numbers before I sign off?\n\nThanks,\nEmily Davis",
  },
  {
    id: "c6",
    sender: "Emily Davis",
    subject: "Re: Question about Budget",
    preview:
      "Following up on my previous note — I've attached the revised spreadsheet with the updated figures for your review...",
    time: "Jun 11, 2026",
    tag: "Replied",
    body: "Following up on my previous note — I've attached the revised spreadsheet with the updated figures for your review. The totals now reconcile with the master budget.\n\nLet me know if it looks good.\n\nThanks,\nEmily Davis",
  },
];

export const TALENT_MESSAGES = [
  {
    id: "t1",
    sender: "Andre Miller",
    subject: "Availability Confirmed",
    preview:
      "Just confirming I'm available for the Povison shoot next week. Looking forward to it — let me know the call time...",
    time: "11:05 AM",
    tag: "Replied",
    body: "Hi, just confirming I'm available for the Povison shoot next week. Looking forward to it — let me know the final call time and wardrobe details when you have them.\n\nBest,\nAndre Miller",
  },
  {
    id: "t2",
    sender: "Sofia Lin",
    subject: "Meeting Tomorrow",
    preview:
      "Hi, can we have a quick chat tomorrow about the lifestyle campaign? I have a couple of scheduling questions...",
    time: "Jun 15, 2026 9:30 AM",
    tag: "Pending",
    body: "Hi, can we have a quick chat tomorrow about the lifestyle campaign? I have a couple of scheduling questions and want to make sure I block the right dates.\n\nLet me know what works for you.\n\nThanks,\nSofia Lin",
  },
  {
    id: "t3",
    sender: "Liu Mei",
    subject: "Re: Product Photography Rates",
    preview:
      "Thanks for reaching out. My hand-modeling rate for product photography is $180/hr. Happy to discuss the scope...",
    time: "Jun 14, 2026",
    tag: "Replied",
    body: "Thanks for reaching out. My hand-modeling rate for product photography is $180/hr. Happy to discuss the scope and any multi-day discounts for the commercial.\n\nLooking forward to working together.\n\nLiu Mei",
  },
  {
    id: "t4",
    sender: "Maya Patel",
    subject: "Wardrobe Question",
    preview:
      "Quick question about the wardrobe for the dance segment — should I bring my own shoes or will they be provided?",
    time: "Jun 13, 2026",
    tag: "Pending",
    body: "Quick question about the wardrobe for the dance segment — should I bring my own shoes or will they be provided on set? Also, is there a specific color palette I should stick to?\n\nThanks,\nMaya Patel",
  },
  {
    id: "t5",
    sender: "David Smith",
    subject: "Portfolio Update",
    preview:
      "I've refreshed my portfolio with the latest editorial work. Sending it over in case it's useful for upcoming casting...",
    time: "Jun 12, 2026",
    tag: "Replied",
    body: "Hi, I've refreshed my portfolio with the latest editorial and runway work. Sending it over in case it's useful for upcoming casting decisions.\n\nLet me know if you need anything else.\n\nBest,\nDavid Smith",
  },
  {
    id: "t6",
    sender: "Sam Lee",
    subject: "Re: Tech Ad Booking",
    preview:
      "Got the booking details, thanks! I'm all set for the shoot. One note — I'll need to leave by 5pm on the second day...",
    time: "Jun 11, 2026",
    tag: "Important",
    body: "Got the booking details, thanks! I'm all set for the shoot. One note — I'll need to leave by 5pm on the second day for a prior commitment, so let's plan my scenes accordingly.\n\nAppreciate it,\nSam Lee",
  },
];

export const CREW_MESSAGES = [
  {
    id: "cr1",
    sender: "Marcus Reed",
    subject: "Camera Package Confirmed",
    preview:
      "Locked in the camera package for the Troxus shoot — Alexa Mini LF with the full Signature Prime set. Let me know if we need a B-cam...",
    time: "10:18 AM",
    tag: "Replied",
    body: "Hi, locked in the camera package for the Troxus shoot — Alexa Mini LF with the full Signature Prime set. Let me know if we need a B-cam for the driving scenes and I'll add it to the order.\n\nHappy to walk through the lens choices on a call if helpful.\n\nBest,\nMarcus Reed\nDirector of Photography",
  },
  {
    id: "cr2",
    sender: "Tina Alvarez",
    subject: "Lighting Plan + Power",
    preview:
      "Sending over the lighting plan for stage 2. We'll need a generator for the exteriors — can you confirm the location has power on tap?",
    time: "Jun 15, 2026 9:30 AM",
    tag: "Pending",
    body: "Hi, sending over the lighting plan for stage 2. We'll need a generator for the exteriors — can you confirm the location has power on tap, or should I book a tow plant?\n\nAlso flagging that the night scene will need extra HMIs. Let me know the budget and I'll size accordingly.\n\nThanks,\nTina Alvarez\nGaffer",
  },
  {
    id: "cr3",
    sender: "Devon Park",
    subject: "Re: Call Time Day 1",
    preview:
      "Got the call sheet, thanks. I'll be on set by 6:30 to prep the carts and pull focus marks before first team arrives...",
    time: "Jun 14, 2026",
    tag: "Replied",
    body: "Got the call sheet, thanks. I'll be on set by 6:30 to prep the carts and pull focus marks before first team arrives. The follow focus and monitors are all charged and tested.\n\nLet me know if the schedule shifts.\n\nDevon Park\n1st AC",
  },
  {
    id: "cr4",
    sender: "Priya Shah",
    subject: "Sound Kit Question",
    preview:
      "Quick question about the dialogue scenes — will we have time for a separate ADR pass, or should I plan to capture everything clean on set?",
    time: "Jun 13, 2026",
    tag: "Pending",
    body: "Quick question about the dialogue scenes — will we have time for a separate ADR pass, or should I plan to capture everything clean on set? The warehouse location has a lot of reverb, so I'd like to bring extra blankets and a second boom op.\n\nLet me know how you'd like to handle it.\n\nThanks,\nPriya Shah\nSound Mixer",
  },
  {
    id: "cr5",
    sender: "Carlos Mendez",
    subject: "Grip Gear Availability",
    preview:
      "I'm available for the full three-day block. I can supply the dolly and track, plus a 12x12 frame for the diffusion you wanted...",
    time: "Jun 12, 2026",
    tag: "Replied",
    body: "Hi, I'm available for the full three-day block. I can supply the dolly and track, plus a 12x12 frame for the diffusion you wanted on the product close-ups.\n\nSend the location details and I'll plan the rigging.\n\nBest,\nCarlos Mendez\nKey Grip",
  },
  {
    id: "cr6",
    sender: "Hannah Lee",
    subject: "Re: PA Assignment",
    preview:
      "Confirmed for the shoot — I'll handle lockups and runs. One note: I'll need to leave by 4pm on the last day for a class...",
    time: "Jun 11, 2026",
    tag: "Important",
    body: "Confirmed for the shoot — I'll handle lockups and runs. One note: I'll need to leave by 4pm on the last day for a class, so let's make sure the late-day runs are covered.\n\nSee you on set!\n\nHannah Lee\nProduction Assistant",
  },
];

export const MESSAGE_TAG_STYLES = {
  Replied: "border-emerald-300 text-emerald-700 bg-emerald-50",
  Pending: "border-amber-300 text-amber-700 bg-amber-50",
  Important: "border-rose-300 text-rose-700 bg-rose-50",
};

export const MESSAGE_REPLY_TO = REPLY_TO;

/** Default assignee for project-workflow tasks. */
export const DEFAULT_ASSIGNEE = { initials: "YD", name: "Yina Dong" };
export const DEFAULT_DUE = "9/18/2026";

/** Prefilled description for a known task; everything else gets a generic one. */
export const TASK_DESCRIPTIONS = {
  "Confirm model and talent bookings":
    "Confirm availability, booking terms, contact information, wardrobe requirements, and call times for all assigned models and talent. Ensure contracts and release forms are completed before production day.",
};
export const GENERIC_DESCRIPTION =
  "Coordinate and complete this task with the assigned team members, and confirm all details before the production day.";

/**
 * Saved talent shortlists for the Talents-tab LIST VIEW (/tmp/sl_listview.png).
 * status ∈ "Confirmed" | "Pending Approval" | "Needs Revision".
 */
export const SAVED_SHORTLISTS = [
  {
    id: "sl-0622",
    name: "E-Bike Launch Campaign Photoshoot Talent Shortlist 06/22/2026",
    date: "June 22,2026",
    status: "Confirmed",
  },
  {
    id: "sl-0601",
    name: "E-Bike Launch Campaign Photoshoot Talent Shortlist 06/01/2026",
    date: "June 1,2026",
    status: "Pending Approval",
  },
  {
    id: "sl-0520",
    name: "E-Bike Launch Campaign Photoshoot Talent Shortlist 05/20/2026",
    date: "May 20,2026",
    status: "Needs Revision",
  },
];

/** Badge styles for the saved-shortlist status pills. */
export const SHORTLIST_STATUS_STYLES = {
  Confirmed: "border-emerald-300 text-emerald-700 bg-emerald-50",
  "Pending Approval": "border-amber-300 text-amber-700 bg-amber-50",
  "Needs Revision": "border-rose-300 text-rose-700 bg-rose-50",
};

/**
 * Call sheets for the Call Sheet tab (/tmp/cs_list.png).
 * status ∈ "Sent" | "Editing". An "Editing" row is a draft → shows
 * "Draft unsent" pills instead of the Views/Confirmed progress rings.
 * total = recipient count; views / confirmed = how many of them acted.
 */
export const CALL_SHEET_TOTAL = 19;

export const CALL_SHEETS = {
  upcoming: [
    {
      id: "cs-0622-sent",
      title: "Photoshoot Call sheet 06/22/2026",
      subtitle: "Sent Tuesday, June 22 2026 @1:40pm",
      date: "June 22,2026",
      status: "Sent",
      views: 4,
      confirmed: 1,
      total: CALL_SHEET_TOTAL,
    },
    {
      id: "cs-0622-draft",
      title: "Photoshoot Call sheet 06/22/2026",
      subtitle: "Sent Tuesday, June 22 2026 @1:40pm",
      date: "June 22,2026",
      status: "Editing",
      views: 0,
      confirmed: 0,
      total: CALL_SHEET_TOTAL,
    },
  ],
  archived: [
    {
      id: "cs-0514",
      title: "Photoshoot Call sheet 05/14/2026",
      subtitle: "Sent Tuesday, June 22 2026 @1:40pm",
      date: "June 22,2026",
      status: "Sent",
      views: 19,
      confirmed: 6,
      total: CALL_SHEET_TOTAL,
    },
    {
      id: "cs-0509",
      title: "Photoshoot Call sheet 05/09/2026",
      subtitle: "Sent Tuesday, June 22 2026 @1:40pm",
      date: "June 22,2026",
      status: "Sent",
      views: 19,
      confirmed: 19,
      total: CALL_SHEET_TOTAL,
    },
  ],
};

export const CALL_SHEET_STATUS_STYLES = {
  Sent: "border-emerald-300 text-emerald-700 bg-emerald-50",
  Editing: "border-amber-300 text-amber-700 bg-amber-50",
};

/** Production crew — recipient picker source for the Create Call Sheet wizard. */
export const CREW = [
  { id: "marcus", name: "Marcus Reed", role: "Director of Photography" },
  { id: "tina", name: "Tina Alvarez", role: "Gaffer" },
  { id: "devon", name: "Devon Park", role: "1st AC" },
  { id: "priya", name: "Priya Shah", role: "Sound Mixer" },
  { id: "carlos", name: "Carlos Mendez", role: "Key Grip" },
  { id: "hannah", name: "Hannah Lee", role: "Production Assistant" },
];

/**
 * Time logs for the Time Log Review screen (/tmp/timelog_hi.png).
 * One shoot day ("TAFT Commercial — Day 1"). Each row carries the table
 * fields plus the detail-pane data: clock events, a review note, and a
 * payable breakdown. status drives the badge:
 *   "Meal break · OT" (amber) | "Ready" (green) | "Late clock-out" (amber)
 *   "Low clock-out" (amber) | "Missing time" (rose).
 * bucket maps a row to a status tab: "pending" | "exception" | "approved".
 */
export const TIME_LOG_DAY = "TAFT Commercial — Day 1";

export const TIME_LOGS = [
  {
    id: "TL-2026-0702-014",
    name: "Xinyi Zhang",
    role: "Model",
    initials: "XZ",
    project: "Provision Furniture",
    date: "JUL 02",
    dateLong: "Jul 2",
    scheduled: "7:00 AM – 5:00 PM",
    scheduledHours: "10.0h",
    actual: "6:54 AM – 6:24 PM",
    actualHours: "11.5h",
    ot: "1.5h",
    total: "$575.00",
    status: "Meal break · OT",
    bucket: "exception",
    exceptions: 2,
    clockEvents: [
      { label: "Clock in", time: "6:54 AM", note: "Location verified", tone: "ok" },
      { label: "Meal out", time: "12:42 PM", note: "30 min break", tone: "ok" },
      { label: "Meal in", time: "1:12 PM", note: "Manual correction", tone: "warn" },
      { label: "Clock out", time: "6:24 PM", note: "1h 24m after wrap", tone: "warn" },
    ],
    reviewNote:
      "Meal break was manually corrected. Clock-out exceeds estimated wrap by 1h 24m.",
    workerNote:
      "Client requested an additional product setup after scheduled wrap.",
    payable: [
      { label: "Regular", detail: "10.0 hrs × $50/hr", amount: "$500.00" },
      { label: "Overtime", detail: "1.5 hrs × $50/hr × 1.0", amount: "$75.00" },
    ],
    totalPayable: "$575.00",
  },
  {
    id: "TL-2026-0702-015",
    name: "Maya Chen",
    role: "Hair & Makeup",
    initials: "MC",
    project: "Provision Furniture",
    date: "JUL 02",
    dateLong: "Jul 2",
    scheduled: "8:00 AM – 6:00 PM",
    scheduledHours: "10.0h",
    actual: "7:58 AM – 6:01 PM",
    actualHours: "10.0h",
    ot: "—",
    total: "$850.00",
    status: "Ready",
    bucket: "pending",
    exceptions: 0,
    clockEvents: [
      { label: "Clock in", time: "7:58 AM", note: "Location verified", tone: "ok" },
      { label: "Meal out", time: "12:30 PM", note: "30 min break", tone: "ok" },
      { label: "Meal in", time: "1:00 PM", note: "On time", tone: "ok" },
      { label: "Clock out", time: "6:01 PM", note: "On schedule", tone: "ok" },
    ],
    reviewNote: null,
    workerNote: "All looks complete and on schedule.",
    payable: [
      { label: "Regular", detail: "10.0 hrs × $85/hr", amount: "$850.00" },
    ],
    totalPayable: "$850.00",
  },
  {
    id: "TL-2026-0702-016",
    name: "Andre Miller",
    role: "Talent",
    initials: "AM",
    project: "Provision Furniture",
    date: "JUL 02",
    dateLong: "Jul 2",
    scheduled: "8:00 AM – 4:00 PM",
    scheduledHours: "8.0h",
    actual: "7:55 AM – 4:24 PM",
    actualHours: "8.4h",
    ot: "0.4h",
    total: "$1,008.00",
    status: "Late clock-out",
    bucket: "exception",
    exceptions: 1,
    clockEvents: [
      { label: "Clock in", time: "7:55 AM", note: "Location verified", tone: "ok" },
      { label: "Meal out", time: "12:00 PM", note: "30 min break", tone: "ok" },
      { label: "Meal in", time: "12:30 PM", note: "On time", tone: "ok" },
      { label: "Clock out", time: "4:24 PM", note: "24m after wrap", tone: "warn" },
    ],
    reviewNote: "Clock-out occurred 24 minutes after the scheduled wrap.",
    workerNote: "Stayed to finish the final hero shot.",
    payable: [
      { label: "Regular", detail: "8.0 hrs × $120/hr", amount: "$960.00" },
      { label: "Overtime", detail: "0.4 hrs × $120/hr × 1.0", amount: "$48.00" },
    ],
    totalPayable: "$1,008.00",
  },
  {
    id: "TL-2026-0702-017",
    name: "Luis Romero",
    role: "1st AC",
    initials: "LR",
    project: "Provision Furniture",
    date: "JUL 02",
    dateLong: "Jul 2",
    scheduled: "6:00 AM – 6:00 PM",
    scheduledHours: "12.0h",
    actual: "5:58 AM – 6:02 PM",
    actualHours: "12.0h",
    ot: "2.0h",
    total: "$960.00",
    status: "Ready",
    bucket: "pending",
    exceptions: 0,
    clockEvents: [
      { label: "Clock in", time: "5:58 AM", note: "Location verified", tone: "ok" },
      { label: "Meal out", time: "11:30 AM", note: "30 min break", tone: "ok" },
      { label: "Meal in", time: "12:00 PM", note: "On time", tone: "ok" },
      { label: "Clock out", time: "6:02 PM", note: "On schedule", tone: "ok" },
    ],
    reviewNote: null,
    workerNote: "Full 12-hour day, pre-approved overtime.",
    payable: [
      { label: "Regular", detail: "10.0 hrs × $60/hr", amount: "$600.00" },
      { label: "Overtime", detail: "2.0 hrs × $60/hr × 3.0", amount: "$360.00" },
    ],
    totalPayable: "$960.00",
  },
  {
    id: "TL-2026-0702-018",
    name: "Nina Patel",
    role: "Wardrobe",
    initials: "NP",
    project: "Provision Furniture",
    date: "JUL 02",
    dateLong: "Jul 2",
    scheduled: "8:00 AM – 6:00 PM",
    scheduledHours: "10.0h",
    actual: "8:02 AM – 5:30 PM",
    actualHours: "9.5h",
    ot: "—",
    total: "$712.50",
    status: "Missing time",
    bucket: "exception",
    exceptions: 1,
    clockEvents: [
      { label: "Clock in", time: "8:02 AM", note: "Location verified", tone: "ok" },
      { label: "Meal out", time: "12:15 PM", note: "30 min break", tone: "ok" },
      { label: "Meal in", time: "12:45 PM", note: "On time", tone: "ok" },
      { label: "Clock out", time: "5:30 PM", note: "Early — no note", tone: "warn" },
    ],
    reviewNote: "Clock-out is 30 minutes early with no submitted reason.",
    workerNote: "—",
    payable: [
      { label: "Regular", detail: "9.5 hrs × $75/hr", amount: "$712.50" },
    ],
    totalPayable: "$712.50",
  },
];

/** Badge styles for the time-log status pills. */
export const TIME_LOG_STATUS_STYLES = {
  "Meal break · OT": "border-amber-300 text-amber-700 bg-amber-50",
  Ready: "border-emerald-300 text-emerald-700 bg-emerald-50",
  "Late clock-out": "border-amber-300 text-amber-700 bg-amber-50",
  "Low clock-out": "border-amber-300 text-amber-700 bg-amber-50",
  "Missing time": "border-rose-300 text-rose-700 bg-rose-50",
};

/**
 * Per-task comment metadata for the Production Workflow table (Figma 6771:4667).
 * Keyed by task title. unread true → red badge (amber pill); unread false but
 * count>0 → gray badge (neutral pill); count 0 → "No comment".
 */
export const TASK_COMMENTS = {
  "Confirm model and talent bookings": { count: 3, unread: true },
  "Scout and lock shoot location": { count: 0, unread: false },
  "Assemble and brief crew": { count: 3, unread: false },
  "Sign contract with client and confirm deposit": { count: 3, unread: false },
  "Confirm art and props": { count: 3, unread: true },
  "Prepare and send call sheet": { count: 3, unread: false },
  "Art/props checklist": { count: 3, unread: true },
  "Rough Edit": { count: 3, unread: true },
  "Color adjustments": { count: 0, unread: false },
};

/** Phased task list for the E-Bike Launch Campaign project workflow. */
export const PROJECT_PHASES = [
  {
    id: "pre-production",
    title: "Pre-production Phase",
    tasks: [
      "Confirm model and talent bookings",
      "Scout and lock shoot location",
      "Assemble and brief crew",
      "Sign contract with client and confirm deposit",
      "Confirm art and props",
    ],
  },
  {
    id: "production",
    title: "Production Phase",
    tasks: ["Prepare and send call sheet", "Art/props checklist"],
  },
  {
    id: "post-production",
    title: "Post Production Phase",
    tasks: ["Rough Edit", "Color adjustments"],
  },
];
