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
