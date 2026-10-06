import type { CategorySlug } from "@/types";

export const SITE = {
  name: "Metro Electric Co.",
  shortName: "Metro Electric",
  tagline: "High-Efficiency BLDC Fans, Engineered in Pakistan",
  description:
    "Metro Electric Co. builds AC/DC inverter ceiling, pedestal and exhaust fans that cut power consumption by up to 64% without compromising airflow.",
  url: "https://metroelectricco.com.pk",
  email: "info@metroelectricco.com.pk",
  /** Primary mobile — same number as WhatsApp. */
  phone: "+92 333 2299144",
  phoneDigits: "923332299144",
  contactPerson: "Mujahid Shabbir",
  landlines: ["021-32625467", "021-32601516"],
  whatsapp: "+92 333 2299144",
  /** Digits only — used to build the wa.me link. */
  whatsappDigits: "923332299144",
  hours: "Sat – Thurs, 9:00 AM – 5:00 PM PKT",
  address: {
    line1: "Opp. Session Court, Gate # 1",
    line2: "M.A. Jinnah Road, Karachi, Pakistan",
    full: "Opp. Session Court, Gate # 1, M.A. Jinnah Road, Karachi, Pakistan",
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
  },
  /** Keyless Google Maps embed for the footer. */
  mapEmbed:
    "https://www.google.com/maps?q=M.A.+Jinnah+Road,+Karachi,+Pakistan&output=embed",
  mapLink:
    "https://www.google.com/maps/search/?api=1&query=M.A.+Jinnah+Road,+Karachi,+Pakistan",
} as const;

export const WHATSAPP_LINK = `https://wa.me/${SITE.whatsappDigits}?text=${encodeURIComponent(
  "Hi Metro Electric Co. — I'd like to know more about your inverter fans.",
)}`;

export interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/catalogue" },
  { label: "About Us", href: "/about" },
  { label: "Export Queries", href: "/export" },
  { label: "Join Us", href: "/join-us" },
  {
    label: "Support",
    href: "/support/faq",
    children: [
      {
        label: "FAQs",
        href: "/support/faq",
        description: "Warranty, service and product questions",
      },
      {
        label: "Contact Us",
        href: "/support/contact",
        description: "Talk to our team directly",
      },
    ],
  },
];

export const FOOTER_COLUMNS: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Return And Exchange", href: "/policies/returns" },
    ],
  },
  {
    heading: "Shop",
    links: [
      { label: "Products", href: "/catalogue" },
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Delivery Policy", href: "/policies/delivery" },
    ],
  },
  {
    heading: "More",
    links: [
      { label: "Export Queries", href: "/export" },
      { label: "Terms And Conditions", href: "/policies/terms" },
      { label: "Contact Us", href: "/support/contact" },
    ],
  },
];

export type CategoryGroup = "fans" | "appliances";

export const CATEGORIES: {
  slug: CategorySlug;
  name: string;
  /** Singular, for taglines like "Royal · Ceiling Fan". */
  singular: string;
  group: CategoryGroup;
  blurb: string;
  /** Fallback artwork when a product has no photo (fan categories only). */
  illustration?: "ceiling-3" | "pedestal" | "exhaust" | "false-ceiling" | "bracket";
}[] = [
  {
    slug: "ceiling-fans-standard",
    name: "Normal Ceiling Fans",
    singular: "Ceiling Fan",
    group: "fans",
    blurb:
      "Classic copper-wound ceiling fans that run on mains and work with any dimmer or regulator.",
    illustration: "ceiling-3",
  },
  {
    slug: "ceiling-fans-acdc",
    name: "AC/DC 45W Ceiling Fans",
    singular: "AC/DC Ceiling Fan",
    group: "fans",
    blurb:
      "Run on 220V mains or 12V DC from a solar panel or battery — around 45 watts, so they keep going through load-shedding.",
    illustration: "ceiling-3",
  },
  {
    slug: "ceiling-fans-inverter",
    name: "30W Inverter Ceiling Fans",
    singular: "Inverter Ceiling Fan",
    group: "fans",
    blurb:
      "BLDC inverter fans drawing as little as 30 watts, with remote control and multiple speeds.",
    illustration: "ceiling-3",
  },
  {
    // Legacy slug, kept so old links and any unclassified product still
    // resolve. The sidebar hides it automatically when nothing uses it.
    slug: "ceiling-fans",
    name: "Ceiling Fans",
    singular: "Ceiling Fan",
    group: "fans",
    blurb: "AC, AC/DC and 30-watt inverter ceiling fans from every major brand.",
    illustration: "ceiling-3",
  },
  {
    slug: "pedestal-fans",
    name: "Pedestal Fans",
    singular: "Pedestal Fan",
    group: "fans",
    blurb: "Portable pedestal and stand fans, AC and AC/DC.",
    illustration: "pedestal",
  },
  {
    slug: "bracket-fans",
    name: "Bracket Fans",
    singular: "Bracket Fan",
    group: "fans",
    blurb: "Wall-mounted bracket and louvre fans for rooms, shops and halls.",
    illustration: "bracket",
  },
  {
    slug: "exhaust-fans",
    name: "Exhaust & Ventilation",
    singular: "Exhaust Fan",
    group: "fans",
    blurb: "Kitchen and washroom exhausts, duct fans and air curtains.",
    illustration: "exhaust",
  },
  {
    slug: "table-fans",
    name: "Table & Louvre Fans",
    singular: "Table Fan",
    group: "fans",
    blurb: "Table, TCP, circumatic and louvre fans.",
    illustration: "pedestal",
  },
  {
    slug: "false-ceiling-fans",
    name: "False Ceiling Fans",
    singular: "False Ceiling Fan",
    group: "fans",
    blurb: "Flush-mount 2x2 fans for gypsum and false ceilings.",
    illustration: "false-ceiling",
  },
  {
    slug: "air-coolers",
    name: "Air Coolers",
    singular: "Air Cooler",
    group: "appliances",
    blurb: "Room air coolers — AC, AC/DC and inverter.",
  },
  {
    slug: "water-heaters",
    name: "Geysers & Water Heaters",
    singular: "Water Heater",
    group: "appliances",
    blurb: "Gas, electric, instant and hybrid geysers.",
  },
  {
    slug: "washing-machines",
    name: "Washing Machines",
    singular: "Washing Machine",
    group: "appliances",
    blurb: "Twin-tub, single-tub washers and spin dryers.",
  },
  {
    slug: "kitchen-appliances",
    name: "Kitchen Appliances",
    singular: "Kitchen Appliance",
    group: "appliances",
    blurb: "Hoods, hobs, cooking ranges, ovens and small kitchen appliances.",
  },
  {
    slug: "water-dispensers",
    name: "Water Dispensers & Coolers",
    singular: "Water Dispenser",
    group: "appliances",
    blurb: "Hot and cold water dispensers and water coolers.",
  },
  {
    slug: "heaters",
    name: "Room Heaters",
    singular: "Room Heater",
    group: "appliances",
    blurb: "Gas, electric, halogen and dish heaters.",
  },
  {
    slug: "other-appliances",
    name: "Other Appliances",
    singular: "Home Appliance",
    group: "appliances",
    blurb: "Air purifiers, irons and other home essentials.",
  },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

/** The brands we stock. `slug` is what Product.brand stores. */
export const BRANDS: { slug: string; name: string; website: string }[] = [
  { slug: "pak-fans", name: "Pak Fans", website: "https://www.pakfansofficial.com" },
  { slug: "royal", name: "Royal", website: "https://royalfans.com" },
  { slug: "super-asia", name: "Super Asia", website: "https://superasiastore.com" },
  { slug: "sk", name: "SK Fans", website: "https://www.skfans.com.pk" },
  { slug: "tamoor", name: "Tamoor Fans", website: "https://www.tamoorfans.com" },
  { slug: "sonex", name: "Sonex", website: "https://www.sonexfan.com" },
  { slug: "gfc", name: "GFC", website: "https://gfcfans.com" },
  { slug: "wester", name: "Wester Fans", website: "https://westerfanofficial.pk" },
  { slug: "voldam", name: "Voldam", website: "https://voldam.com.pk" },
  { slug: "orient", name: "Orient", website: "https://www.orientappliances.pk" },
  { slug: "jackpot", name: "Jackpot", website: "https://www.jackpotappliances.pk" },
  { slug: "nasgas", name: "NasGas", website: "https://nasgas.com" },
  { slug: "hanco", name: "Hanco", website: "https://www.hanco.pk" },
];

export const brandName = (slug: string) => BRANDS.find((b) => b.slug === slug)?.name ?? slug;

export const SAVINGS = {
  regularWatts: 119,
  inverterWatts: 45,
  savingsPercent: 64,
  monthlySavingPkr: 1850,
} as const;

export const HOME_FAQS = [
  {
    q: "What is your return policy?",
    a: "Unused fans in original packaging can be returned within 7 days of delivery. Installed units are covered by the warranty rather than the return policy — our service team will repair or replace any manufacturing defect free of charge.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on Delivery across Pakistan, plus EasyPaisa, JazzCash and Visa/Mastercard through our secure checkout. Bank transfer is available for bulk and dealer orders.",
  },
  {
    q: "How do I track my order?",
    a: "You receive an SMS and email with a tracking number once your order is dispatched — typically within 48 hours. You can also WhatsApp our support line with your order number for a live update.",
  },
  {
    q: "What if I receive a damaged item?",
    a: "Report it within 48 hours with photos of the packaging and unit. We arrange a free pickup and send a replacement — no repair charges, no shipping cost to you.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. We export to the Middle East, Africa and Central Asia. Send volumes and destination through our Export Queries page and our team will quote FOB and CIF pricing.",
  },
  {
    q: "How can I contact customer support?",
    a: `Call ${SITE.phone} or our landlines ${SITE.landlines.join(" / ")} Saturday to Thursday, 9 AM to 5 PM, message us on WhatsApp any time, or email ${SITE.email}. We respond to most queries within one business day.`,
  },
];

export const SUPPORT_FAQS: Record<
  "difference" | "warranty" | "service",
  { q: string; a: string }[]
> = {
  difference: [
    {
      q: "What is the difference between AC/DC and Inverter fans?",
      a: "An AC/DC fan can run on both 220V mains and 12V DC from a solar panel or battery, which makes it useful during load-shedding. An Inverter fan uses a BLDC motor driven by an electronic controller — it always runs on mains but consumes 45–55W instead of 110–120W and offers six precise speeds. Our E-Force range combines both: BLDC efficiency with an AC/DC input stage.",
    },
    {
      q: "How is your fan better than others?",
      a: "We wind our motors with 99.99% pure copper, machine the rotors on CNC equipment in-house, and test every unit for airflow, noise and power draw before it is boxed. The result is a fan that holds its rated RPM for years rather than slowing down after a season.",
    },
    {
      q: "Do I need a stabiliser or special wiring?",
      a: "No. Our inverter fans regulate voltage internally and work on standard household wiring between 140V and 260V. You can keep your existing regulator, though the supplied remote gives finer control.",
    },
  ],
  warranty: [
    {
      q: "What does the warranty cover?",
      a: "Every Metro fan carries a 1-year repair warranty on the motor and electronics against manufacturing defects. The warranty covers parts and labour at any authorised service centre.",
    },
    {
      q: "How do I claim warranty service?",
      a: "Keep your invoice or order number. Call or WhatsApp support, describe the fault, and we will either guide you to the nearest service centre or arrange a pickup in major cities.",
    },
    {
      q: "What voids the warranty?",
      a: "Physical damage, water ingress, unauthorised repairs, and running the fan on voltages outside the rated range. Normal wear on the down-rod finish is also excluded.",
    },
  ],
  service: [
    {
      q: "Do you provide installation?",
      a: "Ceiling fans ship with a full mounting kit and instructions any electrician can follow. In Karachi, Lahore and Islamabad we can arrange paid installation on request.",
    },
    {
      q: "Where are your service centres?",
      a: "We operate service points in Karachi, Lahore, Islamabad, Faisalabad and Multan, plus authorised dealers in most district headquarters. Contact support for the address nearest you.",
    },
    {
      q: "Can I buy spare parts separately?",
      a: "Yes — blades, remotes, capacitors, down-rods and canopies are all available. Share your model name and we will quote and dispatch the part.",
    },
  ],
};

export const CORE_ETHOS = [
  {
    title: "Quality without Compromise",
    body: "At Metro Electric Co., quality is not a benchmark, it is a responsibility. From materials selection to final assembly, every decision is guided by durability, reliability and performance. We do not optimise for the lowest acceptable standard; we engineer for the highest possible one.",
  },
  {
    title: "Responsibility to the Customer",
    body: "Trust is earned through consistency. We view every customer relationship as a long-term commitment, not a transaction. Transparency in production, honest communication and dependable after-sales support are integral to how we operate.",
  },
  {
    title: "Building the Industry, Not Just a Brand",
    body: "Our vision extends beyond individual success. By modernising manufacturing through CNC machining, conveyor-based production and process standardisation, we aim to elevate industry benchmarks across the country.",
  },
  {
    title: "Engineering-Led Innovation",
    body: "Innovation at Metro is driven by engineering, not trends. Long before energy efficiency became an industry talking point, we invested in research, process optimisation and indigenous development of BLDC motor technology.",
  },
  {
    title: "Developing People and Potential",
    body: "A strong industry is built on skilled people. We bridge the gap between academia and industry by providing opportunities for learning, exposure and practical growth — creating clear pathways for talent within this country.",
  },
  {
    title: "Integrity in Every Decision",
    body: "Integrity governs how we manufacture, how we price and how we engage with stakeholders. We choose clarity over shortcuts and responsibility over convenience — which is how enduring relationships get built.",
  },
];
