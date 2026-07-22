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
export const TIME_LOGS = [
  {
    id: "TL-2026-0702-014",
    name: "Xinyi Zhang",
    role: "Hair & Makeup",
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

/**
 * Invoices for the Invoices list + detail screens (Figma 7130:15928 / 7118:15039 /
 * 7132:15937). Rows are verbatim from the list spec. status ∈ "Viewed" | "Not Viewed".
 * `id` (slug) is the route param for /production-v2/invoices/:id — the first row
 * (Invoice #2192) is the fully-specced detail record; the rest reuse its document
 * shape as mock. `total` is the display string; the detail-only rows carry the
 * document body (sender, billTo, dates, lineItems, totals, terms).
 */
export const INVOICE_SENDER = {
  name: "HXVP Marketing Group",
  addressLines: ["1761 International Parkway Suite 110", "Richardson, TX, 75081"],
};

export const INVOICE_TERMS = [
  "Zelle:",
  "project@hxvp.us",
  "",
  "ACH Transfer info:",
  "Bank Of America",
  "Swift Code: BOFAUS3N",
  "Company name: HXVP Marketing Group LLC",
  "Account number: 488104814345",
  "Routing number: 026009593",
];

export const INVOICES = [
  {
    id: "2192",
    reference: "Invoice #2192",
    customer: "3W Management Inc",
    date: "Jun 29, 2026",
    dueDate: "Jul 3, 2026",
    status: "Not Viewed",
    total: "$3,000.00",
    billTo: "3W Management Inc",
    lineItems: [
      {
        item: "Social Media Content 50% Deposit",
        quantity: "1",
        rate: "$3,000.00",
        amount: "$3,000.00",
      },
    ],
    subtotal: "$3,000.00",
    tax: "$0.00",
    balanceDue: "$3,000.00",
  },
  {
    id: "2191",
    reference: "Invoice #2191",
    customer: "Wolfbox Tech Inc",
    date: "Jun 29, 2026",
    dueDate: "Jul 3, 2026",
    status: "Viewed",
    total: "$2,700.00",
  },
  {
    id: "2190",
    reference: "Invoice #2190",
    customer: "Hong Kong Security Group Ltd",
    date: "Jun 28, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$3,381.85",
  },
  {
    id: "2189-a",
    reference: "Invoice #2189",
    customer: "Hong Kong Security Group Ltd",
    date: "Jun 27, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$747.53",
  },
  {
    id: "2189-b",
    reference: "Invoice #2189",
    customer: "Multi-Gold International Ltd",
    date: "Jun 27, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$747.53",
  },
  {
    id: "2189-c",
    reference: "Invoice #2189",
    customer: "Hong Kong Security Group Ltd",
    date: "Jun 27, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$17,200.00",
  },
  {
    id: "2189-d",
    reference: "Invoice #2189",
    customer: "Hong Kong Security Group Ltd",
    date: "Jun 27, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$46,060.00",
  },
  {
    id: "2189-e",
    reference: "Invoice #2189",
    customer: "Multi-Gold International Ltd",
    date: "Jun 27, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$30,250.00",
  },
  {
    id: "2189-f",
    reference: "Invoice #2189",
    customer: "Zhuhai Taichuan Cloud Technology Co., Ltd",
    date: "Jun 27, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$3,250.00",
  },
  {
    id: "2189-g",
    reference: "Invoice #2189",
    customer: "Kin Production Services LLC",
    date: "Jun 27, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$5,250.00",
  },
  {
    id: "2189-h",
    reference: "Invoice #2189",
    customer: "HXVP Studios Internal",
    date: "Jun 27, 2026",
    dueDate: "Jun 30, 2026",
    status: "Viewed",
    total: "$9,840.00",
  },
];

/**
 * Badge styling for invoice statuses. Per the detail/listB specs the pill has a
 * filled dot + label; "Viewed" reads lime-green (#d9f99d bg family) and
 * "Not Viewed" amber (#fde68a). Kept as tailwind arbitrary values so both the
 * list and detail pages can share one map.
 */
export const INVOICE_STATUS_STYLES = {
  Viewed: {
    dot: "#5b6f00",
    badge: "border-transparent bg-[#d9f99d]/80 text-neutral-900",
  },
  "Not Viewed": {
    dot: "#f59e0b",
    badge: "border-transparent bg-[#fde68a]/80 text-neutral-900",
  },
};

export const INVOICES_TOTAL_COUNT = 48;

/**
 * Client (company) records for the Client Details page (Figma 7153:16705).
 * Keyed data drives the KPI row, Details/Bill To cards, and the Invoices table.
 * `id` is the route param for /production-v2/clients/:id.
 */
export const CLIENT_RECORDS = [
  {
    id: "3w-management-inc",
    name: "3W Management Inc",
    initials: "3W",
    created: "Jun 29, 2026, 8:57 AM",
    billTo: "3W Management Inc",
    metrics: {
      invoices: "1",
      payments: "0",
      totalInvoiced: "$3,000.00",
      totalPaid: "—",
    },
    invoices: [
      {
        invoiceId: "2192",
        reference: "Invoice #2192",
        date: "Jun 29, 2026",
        status: "Viewed",
        total: "$3,000.00",
      },
    ],
    payments: [],
  },
];

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

/* ──────────────────────────────────────────────────────────────────────────
 * ROUND-3 (workflow-3 sync) additions
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ACTIVE_PROJECTS — rows for the standalone Active Projects list page
 * (ActiveProjectsV2, Figma 7193:27176). The spec shows 8 identical placeholder
 * rows; we keep them verbatim per the design but vary the `id`/`progress`
 * slightly so React keys stay unique and pagination copy reads naturally.
 * Every row also carries `phase` — the status-pill bucket used by the filter
 * pills ("All Active" | "Pre-production" | "Production" | "Post-production" |
 * "Client Review" | "Archived"). Row click → /production-v2/project.
 *
 * Fields (all display strings, verbatim from the spec cell copy):
 *   project        line-1 project name    ("Spring Lifestyle Collection")
 *   subtitle       line-2 muted detail    ("Product Photography — 24 SKUs")
 *   client         client name            ("Provision Furniture")
 *   budget         formatted USD          ("$3,000.00")
 *   deadline       formatted date         ("Jul 3, 2026")
 *   location       location string        ("Los Angeles,CA" — no space after comma, per spec)
 *   status         badge label / phase    ("Pre-production")
 *   progress       0–100 → progress bar    (37.5 ≈ spec's 21/56px fill)
 */
export const ACTIVE_PROJECTS = [
  {
    id: "ap-1",
    project: "Spring Lifestyle Collection",
    subtitle: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    budget: "$3,000.00",
    deadline: "Jul 3, 2026",
    location: "Los Angeles,CA",
    status: "Pre-production",
    progress: 37.5,
  },
  {
    id: "ap-2",
    project: "Spring Lifestyle Collection",
    subtitle: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    budget: "$3,000.00",
    deadline: "Jul 3, 2026",
    location: "Los Angeles,CA",
    status: "Pre-production",
    progress: 37.5,
  },
  {
    id: "ap-3",
    project: "Spring Lifestyle Collection",
    subtitle: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    budget: "$3,000.00",
    deadline: "Jul 3, 2026",
    location: "Los Angeles,CA",
    status: "Pre-production",
    progress: 37.5,
  },
  {
    id: "ap-4",
    project: "Spring Lifestyle Collection",
    subtitle: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    budget: "$3,000.00",
    deadline: "Jul 3, 2026",
    location: "Los Angeles,CA",
    status: "Pre-production",
    progress: 37.5,
  },
  {
    id: "ap-5",
    project: "Spring Lifestyle Collection",
    subtitle: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    budget: "$3,000.00",
    deadline: "Jul 3, 2026",
    location: "Los Angeles,CA",
    status: "Pre-production",
    progress: 37.5,
  },
  {
    id: "ap-6",
    project: "Spring Lifestyle Collection",
    subtitle: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    budget: "$3,000.00",
    deadline: "Jul 3, 2026",
    location: "Los Angeles,CA",
    status: "Pre-production",
    progress: 37.5,
  },
  {
    id: "ap-7",
    project: "Spring Lifestyle Collection",
    subtitle: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    budget: "$3,000.00",
    deadline: "Jul 3, 2026",
    location: "Los Angeles,CA",
    status: "Pre-production",
    progress: 37.5,
  },
  {
    id: "ap-8",
    project: "Spring Lifestyle Collection",
    subtitle: "Product Photography — 24 SKUs",
    client: "Provision Furniture",
    budget: "$3,000.00",
    deadline: "Jul 3, 2026",
    location: "Los Angeles,CA",
    status: "Pre-production",
    progress: 37.5,
  },
];

/** Filter-pill labels for the Active Projects list (single-select). */
export const ACTIVE_PROJECT_FILTERS = [
  "All Active",
  "Pre-production",
  "Production",
  "Post-production",
  "Client Review",
  "Archived",
];

/**
 * Status-badge styling for the Active Projects list. Per the spec the badge is
 * a filled-dot lime pill (bg #d9f99d/80). We give each phase a distinct tint
 * (matching the Dashboard STATUS_STYLES family) so the filter pills read
 * differently, but the spec's default "Pre-production" stays lime.
 */
export const ACTIVE_PROJECT_STATUS_STYLES = {
  "Pre-production": { dot: "#5b6f00", badge: "border-transparent bg-[#d9f99d]/80 text-neutral-900" },
  Production: { dot: "#b45309", badge: "border-transparent bg-amber-100 text-neutral-900" },
  "Post-production": { dot: "#c2410c", badge: "border-transparent bg-orange-100 text-neutral-900" },
  "Client Review": { dot: "#be123c", badge: "border-transparent bg-rose-100 text-neutral-900" },
  Archived: { dot: "#52525b", badge: "border-transparent bg-neutral-200 text-neutral-900" },
};

/** Pagination copy for the Active Projects footer (verbatim from spec). */
export const ACTIVE_PROJECTS_SHOWING = 11;
export const ACTIVE_PROJECTS_TOTAL = 48;

/**
 * PROJECT_OVERVIEW — content for the restored "Overview" tab of the single
 * project detail page (ProjectV2, Figma 7189:24086). Consumed by the SIBLING
 * agent that owns ProjectV2.jsx. All copy verbatim from the overview spec
 * (project = "E-Bike Launch Campaign"). The Overview tab renders six cards:
 * Description, Approved Budget, Project Details (4-col field row), Talent
 * Requirements (header + subLine + body), Crew Requirements (header + subLine
 * + body), Internal Notes.
 */
export const PROJECT_OVERVIEW = {
  title: "E-Bike Launch Campaign",
  description:
    "E-Bike Launch campaign covering social, e-commerce, and short-form video deliverables for E-bike 2026 seasonal launch.",
  approvedBudget: "$46,000.00",
  details: {
    client: "Nike",
    budget: "$46,000.00",
    deadline: "May 29, 2026",
    primaryLocation: "Los Angeles, CA",
  },
  talentRequirements: {
    subLine: "Admin-entered casting description for this project.",
    body: "Seeking confident lifestyle talent for an E-bike launch campaign, with a natural, approachable look and comfortable on-camera presence. Talent should feel authentic riding or posing with an E-bike in urban and outdoor lifestyle settings. Ideal profiles include active adults, commuters, students, and young professionals who can convey ease, movement, and everyday mobility. Must be comfortable with light riding direction, helmet styling, and candid interaction shots. LA-based talent preferred; availability required for fitting and full shoot day.",
  },
  crewRequirements: {
    subLine: "Staffing needs for production day.",
    body: "Required roles include photographer or DP, camera assistant, producer or production coordinator, production assistants, hair and makeup, wardrobe stylist, and location support. Crew should be comfortable working across multiple exterior locations, managing talent movement safely around E-bikes, and keeping the shoot efficient during natural-light windows. LA-based crew preferred; must be available for prep, shoot day, and wrap.",
  },
  internalNotes:
    "Confirm final shortlist with client before call sheet creation. Keep talent availability, crew holds, and budget changes synced before sending production documents.",
};

/* ═══════════════════════════════════════════════════════════════════════════
 * TALENT PORTAL (wf4) — Maya-facing model portal mock.
 *
 * Consumed by TalentV2Layout, TalentDashboardV2, TalentPortalProfileV2, and
 * TalentEditProfileV2. All copy is verbatim from the wf4 dash/profile/edit specs
 * (fileKey vuZ77RgLUVtzfJKAhb1EEX), EXCEPT design slips we never copy: Yina's
 * frame reused Sofia Lin's card data on Maya's profile (email/IG/age/rate/
 * ethnicity/location/languages) and had an "Uplaod" typo + "Finanace" group
 * label — all corrected here to Maya's edit-form identity (flagged to Yina).
 * ═════════════════════════════════════════════════════════════════════════ */

/* User chip + shared identity for the talent sidebar. */
export const TALENT_PROFILE = {
  chipName: "Maya",
  chipEmail: "m@example.com",
  avatar: "https://i.pravatar.cc/100?img=45",
  photo: "https://i.pravatar.cc/320?img=45",

  // Profile Overview card (read view) — 4×3 field grid. Values aligned with
  // the edit form's Maya identity (the frame showed Sofia Lin's data here).
  name: "MAYA LEE",
  overviewFields: [
    { label: "Gender", value: "Female" },
    { label: "Age", value: "24" },
    { label: "Rate", value: "$85/hr" },
    { label: "Height", value: "5'8\" (173 cm)" },
    { label: "Ethnicity", value: "East Asian" },
    { label: "Location", value: "Los Angeles, CA" },
    { label: "Type", value: "Model" },
    { label: "Email", value: "maya.lee@example.com" },
    { label: "Phone", value: "+1 (310) 555-0184" },
    { label: "Languages", value: "English, Mandarin" },
    { label: "Skills", value: "Yoga, Valid Driver's License" },
    { label: "Instagram", value: "@maya.lee" },
  ],
  experience: {
    highlights:
      "Lifestyle and commercial model with experience in activewear, wellness, e-commerce, and product demonstration shoots. Comfortable with natural movement, speaking moments, and light direction on set.",
    campaigns:
      "E-bike launch campaign, skincare product demo series, fitness lifestyle social ads, and e-commerce apparel shoots for direct-to-consumer brands.",
  },

  // Edit-profile form defaults (distinct sample values per the edit spec).
  editForm: {
    legalName: "Maya Lee",
    gender: "Female",
    age: "24",
    hourlyRate: "$85/hr",
    height: "5'8\" / 173 cm",
    ethnicity: "East Asian",
    location: "Los Angeles, CA",
    typeOfModel: "Commercial / Lifestyle",
    email: "maya.lee@example.com",
    phone: "+1 (310) 555-0184",
    languages: "English, Mandarin",
    instagram: "@maya.lee",
    skills:
      "Cycling, fitness, hand modeling, product demo, light acting, speaking moments, natural lifestyle movement",
    experienceHighlights:
      "Lifestyle and commercial model with experience in activewear, wellness, e-commerce, and product demonstration shoots. Comfortable with natural movement, speaking moments, and light direction on set.",
    notableCampaigns:
      "E-bike launch campaign, skincare product demo series, fitness lifestyle social ads, and e-commerce apparel shoots for direct-to-consumer brands.",
  },
};

/* Casting media tiles — three status variants (Uploaded / Missing / Needs
 * update). Shared shape between the Profile read view and the Edit view. */
export const TALENT_CASTING_MEDIA = [
  {
    title: "Headshot",
    // profile-view desc
    desc: "Front-facing image for roster and shortlist cards.",
    // edit-view desc
    editDesc: "Required. Square crop shown on your profile card.",
    status: "Uploaded",
    action: "Replace",
  },
  {
    title: "Side view",
    editTitle: "Side view shot",
    desc: "Full-body side profile for fit and silhouette review.",
    editDesc: "Required. Full body side profile, vertical preferred.",
    status: "Missing",
    action: "Upload",
  },
  {
    title: "Portfolio PDF",
    desc: "Commercial references, comp card, and past campaign samples.",
    editDesc: "Optional but recommended for previous commercial work.",
    status: "Needs update",
    action: "Upload",
  },
];

/* Media status-pill styling (shape: { bg, text } tailwind arbitrary classes). */
export const TALENT_MEDIA_STATUS_STYLES = {
  Uploaded: { bg: "bg-[#d8ff00]", text: "text-[#09090b]" },
  Missing: { bg: "bg-[#f8f9fa]", text: "text-[#71717a]" },
  "Needs update": { bg: "bg-[#f8f9fa]", text: "text-[#71717a]" },
};

/* ── Talent Dashboard — six-card grid content, verbatim from the dash spec ── */
export const TALENT_DASHBOARD = {
  welcome: "WELCOME BACK, MAYA",
  subtitle: "Here is what needs your attention before your next booking.",

  profileCompletion: {
    title: "PROFILE COMPLETION",
    description: "Complete your casting profile so admin can book you faster.",
    percent: 72,
    percentLabel: "Profile ready for review",
    helper:
      "Next: upload side view shot, commercial work PDF, and confirm measurements.",
  },

  nextBooking: {
    title: "NEXT CONFIRMED BOOKING",
    description: "Your nearest confirmed project and call details.",
    project: "E-Bike Launch Campaign",
    when: "Jul 18, 2026 - 9:00 AM call time - Los Angeles, CA",
    roleRate: "Role: Lifestyle model  |  Rate: $70/hr",
  },

  pendingActions: {
    title: "PENDING ACTIONS",
    items: [
      {
        title: "Confirm booking availability",
        sub: "E-Bike Launch Campaign - due today",
        action: "Respond",
      },
      {
        title: "Complete profile media",
        sub: "Side view shot and commercial PDF requested",
        action: "Upload",
      },
      {
        title: "Review project agreement",
        sub: "Signature needed before shoot day",
        action: "View",
      },
    ],
  },

  bookingSchedule: {
    title: "BOOKING SCHEDULE",
    items: [
      {
        project: "E-Bike Launch Campaign",
        detail: "Confirmed - Jul 18 - Los Angeles, CA",
        badge: "Confirmed",
      },
      {
        project: "Skincare Product Launch",
        detail: "Hold requested- Jul 24 - Dallas, TX",
        badge: "Hold",
      },
      {
        project: "Fitness Apparel Campaign",
        detail: "Hold requested - Aug 2 - Miami, FL",
        badge: "Hold",
      },
    ],
  },

  earnings: {
    title: "EARNINGS",
    description: "Track submitted time logs, invoices, and expected payouts.",
    amount: "$612.50",
    footer: "E-Bike Launch Campaign - 8.75 hrs - invoice attached",
  },

  calendar: {
    title: "CALENDAR",
    description: "Keep availability updated so admin can book you accurately.",
    emphasis: "Next open availability starts Jul 20",
    helper:
      "Add unavailable dates, travel holds, or recurring availability blocks.",
  },
};

/* Booking-schedule badge styling: pale-green Confirmed / amber Hold, both with
 * a leading dot. Shape: { bg, text, dot } tailwind arbitrary classes. */
export const TALENT_BOOKING_BADGE_STYLES = {
  Confirmed: { bg: "bg-[#d9f99d]", text: "text-[#09090b]", dot: "bg-[#65a30d]" },
  Hold: { bg: "bg-[#e8c468]", text: "text-[#09090b]", dot: "bg-[#b45309]" },
};

/* ═══════════════════════════════════════════════════════════════════════════
 * TALENT SUBMISSIONS (wf5) — Admin "Review Talents Submissions" tab.
 *
 * Consumed by TalentsV2's third tab: a Review Queue (left) + detail panel
 * (right) + footer action bar. Each queue entry carries the full submitted
 * profile shown in the detail pane (photo, 4×3 field grid, experience/campaigns,
 * casting media, portfolio chip, footer meta).
 *
 * DATA CONSISTENCY: Yina's wf5 frame reused Sofia Lin's mixed data on Maya's
 * submission (age 33, $130/hr, Sofia1993@gmail.com, Mixed-race, San Francisco,
 * @sofialin). We DO NOT copy those copy-slips — Maya's submission uses our
 * established corrected Maya identity (24, $85/hr, maya.lee@example.com, East
 * Asian, Los Angeles, @maya.lee) already codified in TALENT_PROFILE. The other
 * queue members keep the spec's data verbatim. `status` ∈ "Review" |
 * "Changes requested" drives the queue badge. `photo`/`castingMedia` use the
 * pravatar seeds from the talent-portal profile so Maya's face matches wf4.
 * ═════════════════════════════════════════════════════════════════════════ */
export const TALENT_SUBMISSIONS = [
  {
    id: "sub-maya-1",
    name: "Maya Lee",
    role: "Commercial model",
    ago: "2h ago",
    status: "Review",
    submittedBy: "Maya Lee",
    submittedAt: "Jul 13, 2026 at 9:42 AM",
    avatar: "https://i.pravatar.cc/100?img=1",
    photo: "https://i.pravatar.cc/320?img=1",
    castingMedia: [
      "https://i.pravatar.cc/300?img=1",
      "https://i.pravatar.cc/300?img=44",
    ],
    fields: [
      { label: "Gender", value: "Female" },
      { label: "Age", value: "24" },
      { label: "Rate", value: "$85/hr" },
      { label: "Height", value: "5'8\" (173 cm)" },
      { label: "Ethnicity", value: "East Asian" },
      { label: "Location", value: "Los Angeles" },
      { label: "Type", value: "Model" },
      { label: "Email", value: "maya.lee@example.com" },
      { label: "Phone", value: "+1 (310) 555-0184" },
      { label: "Languages", value: "English, Mandarin" },
      { label: "Skills", value: "Yoga, Valid Driver's License" },
      { label: "Instagram", value: "@maya.lee" },
    ],
    experience: {
      highlights:
        "Lifestyle and commercial model with experience in activewear, wellness, e-commerce, and product demonstration shoots. Comfortable with natural movement, speaking moments, and light direction on set.",
      campaigns:
        "E-bike launch campaign, skincare product demo series, fitness lifestyle social ads, and e-commerce apparel shoots for direct-to-consumer brands.",
    },
    // Card appended to the Talent Pool grid on approval (TalentCard shape).
    poolCard: {
      id: "maya-lee-approved",
      name: "Maya Lee",
      role: "Model",
      city: "Los Angeles",
      rate: 85,
      tagline: "Lifestyle, commercial, activewear",
      age: 24,
      height: "5ft 8in",
      gender: "Woman",
      ethnicity: "Asian",
      img: 1,
    },
  },
  {
    id: "sub-jordan",
    name: "Jordan Park",
    role: "Fitness model",
    ago: "2h ago",
    status: "Review",
    submittedBy: "Jordan Park",
    submittedAt: "Jul 13, 2026 at 9:31 AM",
    avatar: "https://i.pravatar.cc/100?img=2",
    photo: "https://i.pravatar.cc/320?img=2",
    castingMedia: [
      "https://i.pravatar.cc/300?img=2",
      "https://i.pravatar.cc/300?img=51",
    ],
    fields: [
      { label: "Gender", value: "Male" },
      { label: "Age", value: "29" },
      { label: "Rate", value: "$95/hr" },
      { label: "Height", value: "6'0\" (183 cm)" },
      { label: "Ethnicity", value: "East Asian" },
      { label: "Location", value: "Los Angeles" },
      { label: "Type", value: "Model" },
      { label: "Email", value: "jordan.park@example.com" },
      { label: "Phone", value: "+1 (213) 555-0142" },
      { label: "Languages", value: "English, Korean" },
      { label: "Skills", value: "Weightlifting, Boxing, Yoga" },
      { label: "Instagram", value: "@jordan.park" },
    ],
    experience: {
      highlights:
        "Fitness and activewear model with experience in gym, athleisure, and supplement campaigns. Comfortable with dynamic movement, strength poses, and on-camera direction.",
      campaigns:
        "Protein brand launch, athleisure e-commerce shoots, gym franchise social ads, and wearable fitness tech product demos.",
    },
    poolCard: {
      id: "jordan-park-approved",
      name: "Jordan Park",
      role: "Model",
      city: "Los Angeles",
      rate: 95,
      tagline: "Fitness, activewear, athleisure",
      age: 29,
      height: "6ft 0in",
      gender: "Man",
      ethnicity: "Asian",
      img: 2,
    },
  },
  {
    id: "sub-ari",
    name: "Ari Chen",
    role: "Hand model",
    ago: "2h ago",
    status: "Review",
    submittedBy: "Ari Chen",
    submittedAt: "Jul 13, 2026 at 9:18 AM",
    avatar: "https://i.pravatar.cc/100?img=3",
    photo: "https://i.pravatar.cc/320?img=3",
    castingMedia: [
      "https://i.pravatar.cc/300?img=3",
      "https://i.pravatar.cc/300?img=20",
    ],
    fields: [
      { label: "Gender", value: "Non-binary" },
      { label: "Age", value: "27" },
      { label: "Rate", value: "$120/hr" },
      { label: "Height", value: "5'6\" (168 cm)" },
      { label: "Ethnicity", value: "East Asian" },
      { label: "Location", value: "Los Angeles" },
      { label: "Type", value: "Hand Model" },
      { label: "Email", value: "ari.chen@example.com" },
      { label: "Phone", value: "+1 (310) 555-0176" },
      { label: "Languages", value: "English, Mandarin" },
      { label: "Skills", value: "Product handling, Jewelry modeling" },
      { label: "Instagram", value: "@ari.chen" },
    ],
    experience: {
      highlights:
        "Detail-focused hand model with experience in jewelry, tech, and beauty product photography. Steady, expressive hands with precise, repeatable movement for close-up work.",
      campaigns:
        "Smartwatch reveal series, luxury jewelry catalog, skincare application demos, and premium packaging unboxing content.",
    },
    poolCard: {
      id: "ari-chen-approved",
      name: "Ari Chen",
      role: "Hand Model",
      city: "Los Angeles",
      rate: 120,
      tagline: "Jewelry, tech, beauty close-ups",
      age: 27,
      height: "5ft 6in",
      gender: "Non-binary",
      ethnicity: "Asian",
      img: 3,
    },
  },
  {
    id: "sub-sofia",
    name: "Sofia Rivera",
    role: "Fashion model",
    ago: "2h ago",
    status: "Review",
    submittedBy: "Sofia Rivera",
    submittedAt: "Jul 13, 2026 at 9:04 AM",
    avatar: "https://i.pravatar.cc/100?img=4",
    photo: "https://i.pravatar.cc/320?img=4",
    castingMedia: [
      "https://i.pravatar.cc/300?img=4",
      "https://i.pravatar.cc/300?img=32",
    ],
    fields: [
      { label: "Gender", value: "Female" },
      { label: "Age", value: "26" },
      { label: "Rate", value: "$110/hr" },
      { label: "Height", value: "5'9\" (175 cm)" },
      { label: "Ethnicity", value: "Latina" },
      { label: "Location", value: "Miami" },
      { label: "Type", value: "Model" },
      { label: "Email", value: "sofia.rivera@example.com" },
      { label: "Phone", value: "+1 (305) 555-0198" },
      { label: "Languages", value: "English, Spanish" },
      { label: "Skills", value: "Runway, Editorial posing" },
      { label: "Instagram", value: "@sofia.rivera" },
    ],
    experience: {
      highlights:
        "Fashion and editorial model with runway and lookbook experience across resort and ready-to-wear collections. Strong posing range and comfortable with fast wardrobe changes.",
      campaigns:
        "Resort-wear lookbook, swimwear editorial, boutique runway shows, and seasonal ready-to-wear e-commerce shoots.",
    },
    poolCard: {
      id: "sofia-rivera-approved",
      name: "Sofia Rivera",
      role: "Model",
      city: "Miami",
      rate: 110,
      tagline: "Fashion, editorial, runway",
      age: 26,
      height: "5ft 9in",
      gender: "Woman",
      ethnicity: "Mixed",
      img: 4,
    },
  },
  {
    id: "sub-noah",
    name: "Noah Kim",
    role: "Commercial actor",
    ago: "2h ago",
    status: "Review",
    submittedBy: "Noah Kim",
    submittedAt: "Jul 13, 2026 at 8:52 AM",
    avatar: "https://i.pravatar.cc/100?img=6",
    photo: "https://i.pravatar.cc/320?img=6",
    castingMedia: [
      "https://i.pravatar.cc/300?img=6",
      "https://i.pravatar.cc/300?img=60",
    ],
    fields: [
      { label: "Gender", value: "Male" },
      { label: "Age", value: "34" },
      { label: "Rate", value: "$140/hr" },
      { label: "Height", value: "5'11\" (180 cm)" },
      { label: "Ethnicity", value: "East Asian" },
      { label: "Location", value: "Los Angeles" },
      { label: "Type", value: "Actor" },
      { label: "Email", value: "noah.kim@example.com" },
      { label: "Phone", value: "+1 (323) 555-0121" },
      { label: "Languages", value: "English, Korean" },
      { label: "Skills", value: "Improv, Voiceover, Comedy" },
      { label: "Instagram", value: "@noah.kim" },
    ],
    experience: {
      highlights:
        "Commercial actor with experience in tech, retail, and lifestyle spots. Natural comedic timing, strong on-camera presence, and comfortable improvising around a brief.",
      campaigns:
        "Streaming service launch spot, national retail holiday campaign, fintech app explainer series, and lifestyle brand narrative ads.",
    },
    poolCard: {
      id: "noah-kim-approved",
      name: "Noah Kim",
      role: "Actor",
      city: "Los Angeles",
      rate: 140,
      tagline: "Tech, retail, lifestyle spots",
      age: 34,
      height: "5ft 11in",
      gender: "Man",
      ethnicity: "Asian",
      img: 6,
    },
  },
  {
    id: "sub-maya-2",
    name: "Maya Lee",
    role: "Commercial model",
    ago: "2h ago",
    status: "Review",
    submittedBy: "Maya Lee",
    submittedAt: "Jul 13, 2026 at 8:40 AM",
    avatar: "https://i.pravatar.cc/100?img=7",
    photo: "https://i.pravatar.cc/320?img=7",
    castingMedia: [
      "https://i.pravatar.cc/300?img=7",
      "https://i.pravatar.cc/300?img=44",
    ],
    fields: [
      { label: "Gender", value: "Female" },
      { label: "Age", value: "24" },
      { label: "Rate", value: "$85/hr" },
      { label: "Height", value: "5'8\" (173 cm)" },
      { label: "Ethnicity", value: "East Asian" },
      { label: "Location", value: "Los Angeles" },
      { label: "Type", value: "Model" },
      { label: "Email", value: "maya.lee@example.com" },
      { label: "Phone", value: "+1 (310) 555-0184" },
      { label: "Languages", value: "English, Mandarin" },
      { label: "Skills", value: "Yoga, Valid Driver's License" },
      { label: "Instagram", value: "@maya.lee" },
    ],
    experience: {
      highlights:
        "Lifestyle and commercial model with experience in activewear, wellness, e-commerce, and product demonstration shoots. Comfortable with natural movement, speaking moments, and light direction on set.",
      campaigns:
        "E-bike launch campaign, skincare product demo series, fitness lifestyle social ads, and e-commerce apparel shoots for direct-to-consumer brands.",
    },
    poolCard: {
      id: "maya-lee-2-approved",
      name: "Maya Lee",
      role: "Model",
      city: "Los Angeles",
      rate: 85,
      tagline: "Lifestyle, commercial, activewear",
      age: 24,
      height: "5ft 8in",
      gender: "Woman",
      ethnicity: "Asian",
      img: 7,
    },
  },
  {
    id: "sub-eli",
    name: "Eli Nakamura",
    role: "Lifestyle model",
    ago: "3h ago",
    status: "Review",
    submittedBy: "Eli Nakamura",
    submittedAt: "Jul 13, 2026 at 8:15 AM",
    avatar: "https://i.pravatar.cc/100?img=8",
    photo: "https://i.pravatar.cc/320?img=8",
    castingMedia: [
      "https://i.pravatar.cc/300?img=8",
      "https://i.pravatar.cc/300?img=68",
    ],
    fields: [
      { label: "Gender", value: "Male" },
      { label: "Age", value: "31" },
      { label: "Rate", value: "$90/hr" },
      { label: "Height", value: "5'10\" (178 cm)" },
      { label: "Ethnicity", value: "East Asian" },
      { label: "Location", value: "Los Angeles" },
      { label: "Type", value: "Model" },
      { label: "Email", value: "eli.nakamura@example.com" },
      { label: "Phone", value: "+1 (424) 555-0133" },
      { label: "Languages", value: "English, Japanese" },
      { label: "Skills", value: "Surfing, Cycling, Cooking" },
      { label: "Instagram", value: "@eli.nakamura" },
    ],
    experience: {
      highlights:
        "Lifestyle model with a warm, approachable look for wellness, food, and outdoor brands. Comfortable with candid movement and everyday-moment direction.",
      campaigns:
        "Meal-kit lifestyle series, outdoor apparel catalog, coffee brand social content, and wellness app promo shoots.",
    },
    poolCard: {
      id: "eli-nakamura-approved",
      name: "Eli Nakamura",
      role: "Model",
      city: "Los Angeles",
      rate: 90,
      tagline: "Lifestyle, wellness, outdoor",
      age: 31,
      height: "5ft 10in",
      gender: "Man",
      ethnicity: "Asian",
      img: 8,
    },
  },
  {
    id: "sub-priya",
    name: "Priya Anand",
    role: "Commercial model",
    ago: "3h ago",
    status: "Review",
    submittedBy: "Priya Anand",
    submittedAt: "Jul 13, 2026 at 7:58 AM",
    avatar: "https://i.pravatar.cc/100?img=10",
    photo: "https://i.pravatar.cc/320?img=10",
    castingMedia: [
      "https://i.pravatar.cc/300?img=10",
      "https://i.pravatar.cc/300?img=48",
    ],
    fields: [
      { label: "Gender", value: "Female" },
      { label: "Age", value: "28" },
      { label: "Rate", value: "$100/hr" },
      { label: "Height", value: "5'6\" (168 cm)" },
      { label: "Ethnicity", value: "South Asian" },
      { label: "Location", value: "Los Angeles" },
      { label: "Type", value: "Model" },
      { label: "Email", value: "priya.anand@example.com" },
      { label: "Phone", value: "+1 (310) 555-0159" },
      { label: "Languages", value: "English, Hindi" },
      { label: "Skills", value: "Dance, Yoga, Public speaking" },
      { label: "Instagram", value: "@priya.anand" },
    ],
    experience: {
      highlights:
        "Commercial and lifestyle model with beauty and wellness campaign experience. Expressive, camera-friendly, and comfortable with speaking moments and light choreography.",
      campaigns:
        "Beauty brand launch, wellness subscription ads, jewelry lookbook, and lifestyle e-commerce apparel shoots.",
    },
    poolCard: {
      id: "priya-anand-approved",
      name: "Priya Anand",
      role: "Model",
      city: "Los Angeles",
      rate: 100,
      tagline: "Commercial, beauty, wellness",
      age: 28,
      height: "5ft 6in",
      gender: "Woman",
      ethnicity: "Indian",
      img: 10,
    },
  },
];

/* Queue status-badge styling for the review tab. "Review" = lime-300 (#d9f99d);
 * "Changes requested" = soft amber (set when an admin requests changes). */
export const SUBMISSION_STATUS_STYLES = {
  Review: "bg-[#d9f99d] text-[#09090b]",
  "Changes requested": "bg-[#fde68a] text-[#09090b]",
};

/* ═══════════════════════════════════════════════════════════════════════════
 * CREW PORTAL (Jerry draft — pending Yina refinement) — data for the crew-facing portal.
 *
 * Persona: Xinyi Zhang, Hair & Makeup crew (she already appears in TIME_LOGS
 * on the Provision Furniture shoot). This block answers PRD §B crew reqs:
 * Accept/Decline Booking, view Call Sheet (+confirm receipt), Time Log submit,
 * Time Log Reminder. Strings stay consistent with existing v2 projects
 * (E-Bike Launch Campaign, TART Commercial, Provision Furniture).
 *
 * Consumed by CrewV2Layout (user chip), CrewDashboardV2, CrewBookingsV2 and
 * CrewCallSheetsV2. Day rate = $50/hr H&M rate × a 10h standard day = $500/day,
 * consistent with Xinyi's $50/hr rate in her Provision Furniture TIME_LOGS entry
 * ($575 = 10h × $50 + 1.5h OT × $50). Earnings mirror the TalentV2 dashboard
 * "invoice attached" pattern.
 * ═════════════════════════════════════════════════════════════════════════ */

/* User-chip identity for the crew portal sidebar. img=25 is unused elsewhere in
 * this mock (see pravatar seeds across the file). */
export const CREW_PROFILE = {
  chipName: "Xinyi",
  chipEmail: "x@example.com",
  fullName: "Xinyi Zhang",
  role: "Hair & Makeup",
  initials: "XZ",
  avatar: "https://i.pravatar.cc/100?img=25",
  photo: "https://i.pravatar.cc/320?img=25",
};

/* Booking REQUESTS — pending Accept/Decline decisions (PRD §B: Accept/Decline
 * Booking). Each carries project, client, dates, role, day rate, location, note.
 * `respondBy` drives the urgency line on the dashboard + bookings queue. */
export const CREW_BOOKING_REQUESTS = [
  {
    id: "REQ-2026-0714-01",
    project: "Smart Home Product Reveal",
    client: "GE Consumer",
    dates: "Jul 22, 2026",
    dateRange: "Jul 22 – Jul 23, 2026",
    role: "Hair & Makeup",
    dayRate: "$500/day",
    hourlyRate: "$50/hr",
    location: "Siren Studios, Hollywood, CA",
    callTime: "7:30 AM",
    respondBy: "Respond by Jul 16",
    urgent: true,
    note: "Two-day studio commercial. Clean, camera-ready beauty looks for two on-camera presenters demoing smart-home devices; continuity across studio vignettes. Kit provided; bring your own brush set.",
  },
  {
    id: "REQ-2026-0714-02",
    project: "TART Commercial",
    client: "TART Beverages",
    dates: "Jul 24, 2026",
    dateRange: "Jul 24, 2026",
    role: "Hair & Makeup",
    dayRate: "$500/day",
    hourlyRate: "$50/hr",
    location: "Stage 4, Quixote Studios, Los Angeles, CA",
    callTime: "7:00 AM",
    respondBy: "Respond by Jul 19",
    urgent: false,
    note: "Studio beauty commercial, glossy editorial look for two principal talent. Full glam plus continuity across six setups. HD-ready product close-ups.",
  },
  {
    id: "REQ-2026-0714-03",
    project: "Provision Furniture",
    client: "Provision Home",
    dates: "Aug 3, 2026",
    dateRange: "Aug 3, 2026",
    role: "Hair & Makeup",
    dayRate: "$500/day",
    hourlyRate: "$50/hr",
    location: "Provision Loft, Downtown Los Angeles, CA",
    callTime: "8:00 AM",
    respondBy: "Respond by Jul 28",
    urgent: false,
    note: "Catalog lifestyle shoot. Clean, minimal everyday looks for three talent across living-room and kitchen sets. Light grooming for two male models.",
  },
];

/* CONFIRMED bookings — accepted, on the calendar. `callSheetId` links to the
 * matching call sheet where one exists. */
export const CREW_CONFIRMED_BOOKINGS = [
  {
    id: "BKG-2026-0702-09",
    project: "Provision Furniture",
    client: "Provision Home",
    dates: "Jul 2, 2026",
    dateRange: "Jul 2, 2026",
    role: "Hair & Makeup",
    dayRate: "$500/day",
    hourlyRate: "$50/hr",
    location: "Provision Loft, Downtown Los Angeles, CA",
    callTime: "8:00 AM",
    status: "Wrapped",
    callSheetId: "CS-2026-0702",
    note: "Shoot complete. Time log submitted — invoice attached and awaiting admin review.",
  },
  {
    id: "BKG-2026-0710-11",
    project: "E-Bike Launch Campaign",
    client: "HXVP Marketing Group",
    dates: "Jul 18, 2026",
    dateRange: "Jul 18 – Jul 19, 2026",
    role: "Hair & Makeup",
    dayRate: "$500/day",
    hourlyRate: "$50/hr",
    location: "Griffith Park, Los Angeles, CA",
    callTime: "6:30 AM",
    status: "Confirmed",
    callSheetId: "CS-2026-0718",
    note: "Nearest confirmed booking. Call sheet issued — please confirm receipt before shoot day.",
  },
];

/* CALL SHEETS — upcoming (one unconfirmed, one confirmed) + archived (2). PRD
 * §B: view Call Sheet + confirm receipt. `status` ∈ "Unconfirmed" | "Confirmed"
 * | "Archived" drives the pill + the "Confirm receipt" affordance. */
export const CREW_CALL_SHEETS = [
  {
    id: "CS-2026-0718",
    title: "E-Bike Launch Campaign — Day 1",
    project: "E-Bike Launch Campaign",
    date: "Jul 18, 2026",
    callTime: "6:30 AM",
    location: "Griffith Park, Los Angeles, CA",
    status: "Unconfirmed",
    group: "upcoming",
    note: "Crew call 6:30 AM at the Fern Dell lot. Sunrise beauty looks; touch-up station under the east canopy.",
  },
  {
    id: "CS-2026-0724",
    title: "TART Commercial — Studio Day",
    project: "TART Commercial",
    date: "Jul 24, 2026",
    callTime: "7:00 AM",
    location: "Stage 4, Quixote Studios, Los Angeles, CA",
    status: "Confirmed",
    group: "upcoming",
    note: "Glam call 7:00 AM in the upstairs H&M room. Two principals, full editorial glam before first setup at 9:00 AM.",
  },
  {
    id: "CS-2026-0702",
    title: "Provision Furniture — Loft Shoot",
    project: "Provision Furniture",
    date: "Jul 2, 2026",
    callTime: "8:00 AM",
    location: "Provision Loft, Downtown Los Angeles, CA",
    status: "Archived",
    group: "archived",
    note: "Wrapped. Clean lifestyle looks across living-room and kitchen sets.",
  },
  {
    id: "CS-2026-0620",
    title: "Skincare Product Demo — Studio",
    project: "Skincare Product Launch",
    date: "Jun 20, 2026",
    callTime: "7:30 AM",
    location: "Loft 5, Smashbox Studios, Culver City, CA",
    status: "Archived",
    group: "archived",
    note: "Wrapped. Dewy no-makeup looks for close-up product application.",
  },
];

/* Call-sheet status-pill styling. Shape: { bg, text, dot } tailwind classes,
 * mirroring TALENT_BOOKING_BADGE_STYLES. */
export const CREW_CALL_SHEET_STATUS_STYLES = {
  Unconfirmed: { bg: "bg-[#e8c468]", text: "text-[#09090b]", dot: "bg-[#b45309]" },
  Confirmed: { bg: "bg-[#d9f99d]", text: "text-[#09090b]", dot: "bg-[#65a30d]" },
  Archived: { bg: "bg-[#f8f9fa]", text: "text-[#71717a]", dot: "bg-[#a1a1aa]" },
};

/* Booking status-pill styling (confirmed-bookings list). */
export const CREW_BOOKING_STATUS_STYLES = {
  Confirmed: { bg: "bg-[#d9f99d]", text: "text-[#09090b]", dot: "bg-[#65a30d]" },
  Wrapped: { bg: "bg-[#f8f9fa]", text: "text-[#71717a]", dot: "bg-[#a1a1aa]" },
};

/* CREW DASHBOARD — six-card grid content, mirroring TALENT_DASHBOARD's shape so
 * CrewDashboardV2 can reuse the TalentDashboardV2 grid patterns. Pending actions
 * lead with the booking-response + the "Submit time log" reminder (PRD §B: Time
 * Log Reminder). Earnings derive from Xinyi's Provision Furniture TIME_LOGS
 * entry ($575.00, 11.5 hrs). Schedule badges reuse CREW_BOOKING_BADGE_STYLES. */
export const CREW_DASHBOARD = {
  welcome: "WELCOME BACK, XINYI",
  subtitle: "Here is what needs your attention before your next call time.",

  nextBooking: {
    title: "NEXT CONFIRMED BOOKING",
    description: "Your nearest confirmed shoot and call details.",
    project: "E-Bike Launch Campaign",
  },

  pendingActions: {
    title: "PENDING ACTIONS",
    items: [
      {
        title: "Respond to booking request",
        sub: "Smart Home Product Reveal - respond by Jul 16",
        action: "Respond",
      },
      {
        title: "Submit time log",
        sub: "Provision Furniture - Jul 2 shoot awaiting your hours",
        action: "Submit",
      },
      {
        title: "Confirm call sheet receipt",
        sub: "E-Bike Launch Campaign - Day 1 call sheet issued",
        action: "Confirm",
      },
    ],
  },

  bookingSchedule: {
    title: "BOOKING SCHEDULE",
    items: [
      {
        project: "E-Bike Launch Campaign",
        detail: "Confirmed - Jul 18 - Griffith Park, LA",
        badge: "Confirmed",
      },
      {
        project: "Smart Home Product Reveal",
        detail: "Request pending - Jul 22 - Siren Studios, LA",
        badge: "Request",
      },
      {
        project: "TART Commercial",
        detail: "Request pending - Jul 24 - Quixote Studios, LA",
        badge: "Request",
      },
    ],
  },

  earnings: {
    title: "EARNINGS",
    description: "Track submitted time logs, invoices, and expected payouts.",
    amount: "$575.00",
    footer: "Provision Furniture - 11.5 hrs - invoice attached",
  },

  callSheet: {
    title: "NEXT CALL SHEET",
    description: "Confirm receipt so production knows you are set for the day.",
    emphasis: "E-Bike Launch Campaign — Day 1",
    helper: "Jul 18 - 6:30 AM call - Griffith Park. Receipt not yet confirmed.",
  },

  timeLogReminder: {
    title: "TIME LOG REMINDER",
    description: "One shoot is waiting on your submitted hours.",
    emphasis: "Provision Furniture - Jul 2",
    helper:
      "Submit your work hours and attach an invoice so admin can approve payment.",
  },
};

/* Dashboard booking-schedule badge styling. Confirmed = pale green;
 * Request = amber (pending Accept/Decline); Wrapped = neutral. */
export const CREW_BOOKING_BADGE_STYLES = {
  Confirmed: { bg: "bg-[#d9f99d]", text: "text-[#09090b]", dot: "bg-[#65a30d]" },
  Request: { bg: "bg-[#e8c468]", text: "text-[#09090b]", dot: "bg-[#b45309]" },
  Wrapped: { bg: "bg-[#f8f9fa]", text: "text-[#71717a]", dot: "bg-[#a1a1aa]" },
};

/**
 * PROJECT_BUDGET — seed rows for Yina's editable Project Budget table, now its
 * own dedicated "Budget" project tab (Figma frame "Project  Production Budget" /
 * node 7331:19825). Four sections; each row carries a free-text `qty` (e.g.
 * "1 day", "2 people", "20%", "10 images", "1 package"), a currency `rate`, and
 * an `actual` currency figure (what was actually spent on that line).
 *
 * Row estimated Total is COMPUTED (not stored): for a percentage qty ("20%",
 * "10%") it is that percent of the rate (rate is the base — agency fee 20% of
 * $7,000 = $1,400; contingency 10% of $12,100 = $1,210); otherwise it is
 * leadingNumber(qty) × rate. Section subtotals + the three project-level totals
 * derive live from the rows:
 *   PROJECT TOTAL ESTIMATED BUDGET = Σ row estimated totals
 *   PROJECT TOTAL ACTUAL COST      = Σ row `actual`
 *   VARIANCE                       = actual − estimated
 *
 * Seed is the design's "no variance yet" state: each row's `actual` equals its
 * estimated total, so estimated = actual = $18,860.00 and variance = $0.00 —
 * matching the three total figures printed in the frame. Editing any Qty/Rate
 * recomputes estimated + variance live.
 *
 * ── DATA SLIPS FLAGGED (kept faithful/correct here; confirm with Yina) ────────
 * The frame's printed section subtotals + $18,860 grand total do NOT reconcile
 * with the rows it draws, so we compute everything live instead of hard-coding:
 *   • The frame's Talent section shows only 2 rows (Model, Talent agency fee)
 *     yet prints "Section Subtotal: $5,600.00" — which is the OLD 3-row total.
 *     We KEEP all three rows (Lead model + Supporting model + agency fee), so the
 *     live subtotal is a correct $5,600.00 AND the grand estimated total lands on
 *     the frame's headline $18,860.00. (Dropping the row would make both wrong.)
 *   • The frame's Post-production shows only Editing yet prints "$4,110.00"
 *     (a copy of the Production-expenses subtotal). We keep Editing + Retouching;
 *     the live subtotal is a correct $2,900.00. The printed $4,110 is a slip.
 * Per project convention we do NOT copy the stale/mismatched printed figures —
 * we keep the richer, self-consistent data and let the table compute totals.
 *
 * NOTE: the $18,860.00 estimated total still does NOT equal the $46,000.00
 * "Approved Budget" shown on the Overview tab — that is intended (approved budget
 * is the ceiling; this is the itemized breakdown to date).
 */
export const PROJECT_BUDGET = {
  sections: [
    {
      id: "talent",
      label: "Talent",
      rows: [
        {
          id: "talent-lead-model",
          description: "Lead model",
          qty: "1 day",
          rate: "$2,400.00",
          actual: "$2,400.00",
          notes: "Hero rider, usage included",
        },
        {
          id: "talent-supporting-model",
          description: "Supporting model",
          qty: "1 day",
          rate: "$1,800.00",
          actual: "$1,800.00",
          notes: "Lifestyle and product shots",
        },
        {
          id: "talent-agency-fee",
          description: "Talent agency fee",
          qty: "20%",
          rate: "$7,000.00",
          actual: "$1,400.00",
          notes: "Adjust based on final booking",
        },
      ],
    },
    {
      id: "crew",
      label: "Crew",
      rows: [
        {
          id: "crew-photographer",
          description: "Photographer",
          qty: "1 day",
          rate: "$3,200.00",
          actual: "$3,200.00",
          notes: "Full shoot day",
        },
        {
          id: "crew-hmua",
          description: "Hair and makeup artist",
          qty: "1 day",
          rate: "$1,250.00",
          actual: "$1,250.00",
          notes: "Talent prep and touch-ups",
        },
        {
          id: "crew-production-assistant",
          description: "Production assistant",
          qty: "2 people",
          rate: "$900.00",
          actual: "$1,800.00",
          notes: "Load-in, releases, logistics",
        },
      ],
    },
    {
      id: "production-expenses",
      label: "Production expenses",
      rows: [
        {
          id: "expenses-studio-rental",
          description: "Studio rental",
          qty: "1 day",
          rate: "$1,650.00",
          actual: "$1,650.00",
          notes: "Backup indoor setup",
        },
        {
          id: "expenses-equipment-rental",
          description: "Equipment rental",
          qty: "1 package",
          rate: "$1,250.00",
          actual: "$1,250.00",
          notes: "Lighting and grip",
        },
        {
          id: "expenses-contingency",
          description: "Contingency",
          qty: "10%",
          rate: "$12,100.00",
          actual: "$1,210.00",
          notes: "Can remove for smaller shoots",
        },
      ],
    },
    {
      id: "post-production",
      label: "Post-production expenses",
      rows: [
        {
          id: "post-editing",
          description: "Editing",
          qty: "1 package",
          rate: "$1,800.00",
          actual: "$1,800.00",
          notes: "Campaign selects and cutdowns",
        },
        {
          id: "post-retouching",
          description: "Retouching",
          qty: "10 images",
          rate: "$110.00",
          actual: "$1,100.00",
          notes: "Final product and lifestyle images",
        },
      ],
    },
  ],
};
