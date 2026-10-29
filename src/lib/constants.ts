import type { CategorySlug } from "@/types";

export const SITE = {
  name: "Metro Electric Co.",
  shortName: "Metro Electric",
  tagline: "Authorized Dealer, Retailer & Wholesaler of Home Appliances",
  /** Shown beside the logo in the header. */
  slogan: "Now we are online!",
  /**
   * Founding year. Deliberately NOT repeated across the site: the business was
   * founded in 1965 but grew into dealership over time, so "since 1965" next to
   * "authorized dealer" would date the dealership wrongly. The story belongs on
   * the About page; everywhere else states what we are today.
   */
  since: 1965,
  /** Year of the KCCI and KEDA memberships. */
  memberSince: 1997,
  description:
    "Metro Electric Co. is a leading Authorized Dealer, Retailer and Wholesaler of top-tier electric and gas home appliances in Pakistan — genuine products from the country's top brands at unbeatable prices.",
  /**
   * Canonical production origin. Drives `metadataBase`, so it is what every
   * canonical link, Open Graph URL and sitemap entry is built from.
   *
   * Must be a domain that actually resolves: metroelectricco.com.pk does not,
   * which pointed every canonical URL at a dead host.
   */
  url: "https://metroelectromall.com",
  email: "info@metroelectricco.com.pk",
  /** Primary mobile — same number as WhatsApp. */
  phone: "+92 300 3585100",
  phoneDigits: "923003585100",
  contactPerson: "Mujahid Shabbir",
  landlines: ["021-32625467", "021-32601516"],
  whatsapp: "+92 300 3585100",
  /** Digits only — used to build the wa.me link. */
  whatsappDigits: "923003585100",
  hours: "Sat – Thurs, 10:30 AM – 8:00 PM PKT",
  /** Short form for running text, e.g. FAQs. */
  hoursShort: "10:30 AM to 8:00 PM",
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
  /**
   * Google Maps embed for the footer, pinned to the shop's own Place entry
   * rather than a street-name search, which landed in the wrong part of the
   * road. Plus code V234+QV, Seari Quarters, Karachi.
   */
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.274103878947!2d67.00723289999999!3d24.8544862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e04f81cb153%3A0x94fc163516a37d20!2sMetro%20Electric%20Company!5e0!3m2!1sen!2s!4v1791899672377!5m2!1sen!2s",
  mapLink:
    "https://www.google.com/maps/place/Metro+Electric+Company/@24.8544862,67.0072329,17z/data=!3m1!4b1!4m6!3m5!1s0x3eb33e04f81cb153:0x94fc163516a37d20!8m2!3d24.8544862!4d67.0072329!16s%2Fg%2F1td63smr",
} as const;

export const WHATSAPP_LINK = `https://wa.me/${SITE.whatsappDigits}?text=${encodeURIComponent(
  "Hi Metro Electric Co. — I'd like to know more about your products.",
)}`;

/** WhatsApp chat pre-filled with a question about one product (used while its price is coming soon). */
export const productEnquiryLink = (productName: string) =>
  `https://wa.me/${SITE.whatsappDigits}?text=${encodeURIComponent(
    `Hi Metro Electric Co. — I'm interested in the ${productName}. Could you share the price?`,
  )}`;

export interface NavLink {
  label: string;
  href: string;
  /** Small tag shown beside the label, e.g. "Soon". */
  badge?: string;
  children?: { label: string; href: string; description?: string }[];
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/catalogue" },
  { label: "LEGENDS", href: "/legends", badge: "Soon" },
  { label: "About Us", href: "/about" },
  { label: "Wholesale", href: "/wholesale" },
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
      { label: "Wholesale & Bulk Orders", href: "/wholesale" },
      { label: "Terms And Conditions", href: "/policies/terms" },
      { label: "Contact Us", href: "/support/contact" },
    ],
  },
];

export type CategoryGroup = "fans" | "appliances" | "gas" | "lights" | "electrical";

/** Section headings, in display order (catalogue sidebar + homepage). */
export const CATEGORY_GROUPS: { group: CategoryGroup; title: string }[] = [
  { group: "fans", title: "Fans" },
  { group: "appliances", title: "Home Appliances" },
  { group: "gas", title: "Gas Appliances" },
  { group: "lights", title: "Lighting" },
  { group: "electrical", title: "Electrical" },
];

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
    name: "AC/DC Ceiling Fans",
    singular: "AC/DC Ceiling Fan",
    group: "fans",
    blurb:
      "Run on 220V mains or 12V DC from a solar panel or battery, so they keep going through load-shedding.",
    illustration: "ceiling-3",
  },
  {
    slug: "ceiling-fans-inverter",
    name: "30W+ Inverter Ceiling Fans",
    singular: "Inverter Ceiling Fan",
    group: "fans",
    blurb:
      "30W+ inverter fans with remote control — up to 70% energy saving over a regular fan.",
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
    blurb: "Ovens, microwaves, electric cooktops, blenders and small kitchen appliances.",
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
  {
    slug: "gas-hobs",
    name: "Built-in Gas Hobs",
    singular: "Gas Hob",
    group: "gas",
    blurb: "Built-in glass and stainless-steel gas hobs, 2 to 5 burners.",
  },
  {
    slug: "gas-stoves",
    name: "Gas Stoves & Cooking Ranges",
    singular: "Gas Stove",
    group: "gas",
    blurb: "Table-top gas stoves and full cooking ranges with ovens.",
  },
  {
    slug: "kitchen-hoods",
    name: "Kitchen Hoods",
    singular: "Kitchen Hood",
    group: "gas",
    blurb: "Kitchen hoods and chimneys, from 60cm to 90cm.",
  },
  {
    slug: "wall-lights",
    name: "Wall Lights",
    singular: "Wall Light",
    group: "lights",
    blurb: "Decorative indoor wall lights and sconces.",
  },
  {
    slug: "chandeliers",
    name: "Chandeliers",
    singular: "Chandelier",
    group: "lights",
    blurb: "Crystal, modern and classic chandeliers.",
  },
  {
    slug: "down-lights",
    name: "Down Lights",
    singular: "Down Light",
    group: "lights",
    blurb: "LED down lights and spotlights for false ceilings.",
  },
  {
    slug: "outdoor-lights",
    name: "Outdoor Lights",
    singular: "Outdoor Light",
    group: "lights",
    blurb: "Gate, garden and facade lights built for the weather.",
  },
  {
    slug: "table-lamps",
    name: "Table Lamps",
    singular: "Table Lamp",
    group: "lights",
    blurb: "Desk and bedside table lamps.",
  },
  {
    slug: "stand-lamps",
    name: "Stand Lamps",
    singular: "Stand Lamp",
    group: "lights",
    blurb: "Floor-standing lamps for living rooms and corners.",
  },
  {
    slug: "electric-switches",
    name: "Electric Switches",
    singular: "Electric Switch",
    group: "electrical",
    blurb: "Switches, sockets and switch plates.",
  },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

/** The brands we stock. `slug` is what Product.brand stores. */
export const BRANDS: { slug: string; name: string; website: string }[] = [
  { slug: "pak-fans", name: "Pak Fans", website: "https://www.pakfansofficial.com" },
  // Pak Fan's premium range, catalogued separately (Luxus Product Catalogue 2026).
  { slug: "luxus", name: "Luxus by Pak Fan", website: "https://www.pakfansofficial.com" },
  { slug: "royal", name: "Royal", website: "https://royalfans.com" },
  { slug: "super-asia", name: "Super Asia", website: "https://superasiastore.com" },
  { slug: "sk", name: "SK Fans", website: "https://www.skfans.com.pk" },
  { slug: "tamoor", name: "Tamoor Fans", website: "https://www.tamoorfans.com" },
  { slug: "gfc", name: "GFC", website: "https://gfcfans.com" },
  { slug: "wester", name: "Wester Fans", website: "https://westerfanofficial.pk" },
  { slug: "voldam", name: "Voldam", website: "https://voldam.com.pk" },
  { slug: "orient", name: "Orient", website: "https://www.orientappliances.pk" },
  { slug: "jackpot", name: "Jackpot", website: "https://www.jackpotappliances.pk" },
  { slug: "nasgas", name: "NasGas", website: "https://nasgas.com" },
  { slug: "hanco", name: "Hanco", website: "https://www.hanco.pk" },
  { slug: "lahore", name: "Lahore Fan", website: "" },
  { slug: "wahid", name: "Wahid Fan", website: "" },
  { slug: "ricon", name: "Ricon Fan", website: "" },
  // Stocked soon - no products yet, so <BrandStrip /> shows these as
  // "Coming soon" rather than linking to an empty catalogue.
  { slug: "xpert", name: "Xpert", website: "" },
  { slug: "glam-gas", name: "Glam Gas", website: "" },
];

/** Brands announced before any stock exists. */
export const UPCOMING_BRANDS = ["xpert", "glam-gas"] as const;

/**
 * Brands that are stocked and shoppable, but have more models on the way. The
 * tile keeps its product count and its link; it just carries a note.
 */
export const EXPANDING_BRANDS = ["nasgas"] as const;

export const brandName = (slug: string) => BRANDS.find((b) => b.slug === slug)?.name ?? slug;

/**
 * Brand names for prose, e.g. "Pak Fans, Royal, GFC, SK Fans and more".
 *
 * Copy used to hardcode its own list in each place, so the catalogue page, the
 * BLDC section and the efficiency bullets each named a different subset and
 * drifted apart. Deriving them from BRANDS keeps every mention in step when a
 * brand is added or dropped.
 */
export function brandListText(slugs: readonly string[], limit = 7): string {
  const names = slugs
    .map((slug) => BRANDS.find((b) => b.slug === slug)?.name)
    .filter((n): n is string => Boolean(n));

  const shown = names.slice(0, limit);
  const rest = names.length - shown.length;
  return rest > 0 ? `${shown.join(", ")} and more` : shown.join(", ");
}

/**
 * The brands to name in general copy, most prominent first. Every one of these
 * is stocked; FAN_BRANDS below is the narrower list whose fans we actually
 * sell, which is what fan-specific copy must use.
 */
/**
 * Fan brands to name in prose, most prominent first.
 *
 * Not FAN_BRANDS raw: that is ordered for filtering and includes "Luxus by Pak
 * Fan", which reads as a repetition next to "Pak Fans" in a sentence. Super
 * Asia is absent on purpose - it is stocked for home appliances only, so
 * claiming its inverter fans would advertise something the catalogue hides.
 */
export const SHOWCASE_FAN_BRANDS = [
  "pak-fans",
  "royal",
  "gfc",
  "super-asia",
  "sk",
  "tamoor",
  "orient",
  "voldam",
] as const;

export const SHOWCASE_BRANDS = [
  "pak-fans",
  "royal",
  "gfc",
  "sk",
  "super-asia",
  "tamoor",
  "orient",
  "nasgas",
  "hanco",
  "voldam",
] as const;

/**
 * Metro's own home-appliance brands, launching soon. LEGENDS is the lead brand
 * and gets the logo; the others show as wordmarks until their artwork exists.
 * When one launches, add it to BRANDS (to sell its products) and take it off this list.
 */
export const HOUSE_BRANDS: { slug: string; name: string; tagline: string; lead?: boolean }[] = [
  { slug: "legends", name: "LEGENDS", tagline: "Home Appliances", lead: true },
  { slug: "karetek", name: "KARETEK", tagline: "Home Appliances" },
  { slug: "mtek", name: "M.TEK", tagline: "Home Appliances" },
];

/**
 * The brands whose fans we sell. Other brands (Super Asia, Voldam, NasGas…)
 * are stocked for their home appliances only, so their fans are hidden from
 * every fan category. Add a slug here to start selling that brand's fans.
 */
export const FAN_BRANDS = [
  "pak-fans",
  "luxus",
  "royal",
  "super-asia",
  "sk",
  "tamoor",
  "gfc",
  "orient",
  "voldam",
  "wester",
  "lahore",
  "wahid",
  "ricon",
];

/** Inverter-fan efficiency figures used in marketing copy. */
export const SAVINGS = {
  /** Typical conventional induction fan draw, as a range. */
  regularWattsLow: 90,
  regularWattsHigh: 130,
  /** Inverter fans run between these at top speed. */
  inverterWatts: 30,
  inverterWattsHigh: 55,
  savingsPercent: 70,
} as const;

export const HOME_FAQS = [
  {
    q: "What is your return policy?",
    a: "Unused products in their original, sealed packaging can be returned within 7 days of delivery. Once installed, a product is covered by its official brand warranty rather than the return policy — we help you register any claim with the brand's service centre.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on Delivery (Karachi only): transfer the Rs. 300 delivery charge in advance and pay for the order on delivery. Full payment in advance (all cities): transfer the order amount plus Rs. 300 delivery. Bank: MCB Bank Limited, IBAN PK10MUCB0003301010064245, title Metro Electric Co. Then WhatsApp us the receipt and we'll confirm and dispatch your order.",
  },
  {
    q: "Do you deliver outside Karachi?",
    a: "Yes, across Pakistan, for a delivery charge of Rs. 300 per order. Outside Karachi, orders are paid in full in advance by bank transfer and sent by courier or cargo service.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is dispatched, we share the courier or cargo details with you on WhatsApp. You can also WhatsApp us your order number at any time for an update.",
  },
  {
    q: "What if I receive a damaged item?",
    a: "Report it to us within 24 hours of delivery, with photos of the box and the product, and we will arrange a replacement or repair with you.",
  },
  {
    q: "How can I contact customer support?",
    a: `Call ${SITE.phone} or our landlines ${SITE.landlines.join(" / ")}, Saturday to Thursday, ${SITE.hoursShort}, message us on WhatsApp any time, or email ${SITE.email}. We respond to most queries within one business day.`,
  },
];

export const SUPPORT_FAQS: Record<
  "difference" | "warranty" | "service",
  { q: string; a: string }[]
> = {
  difference: [
    {
      q: "What is the difference between AC/DC and Inverter fans?",
      a: "An AC/DC fan runs on 220V mains or on 12V DC from a solar panel or battery, which keeps it going during load-shedding. An inverter fan uses a brushless (BLDC) motor driven by an electronic controller: it runs from about 30W instead of 90W or more — up to 70% energy saving. Many models combine both.",
    },
    {
      q: "Why buy from Metro Electric Co.?",
      a: "We are an authorized dealer, retailer and wholesaler of Pakistan's top brands, so every product is genuine and carries its official brand warranty. You get a wide choice of brands, designs, colours and budgets in one place, at competitive prices, with trained staff to guide you before and after you buy.",
    },
    {
      q: "Do AC/DC and inverter fans need a dimmer or regulator?",
      a: "No. AC/DC and inverter fans are controlled electronically — you set the speed with the remote or the fan's own controls — so they do not need a traditional wall dimmer or regulator. We recommend connecting them to a normal on/off switch.",
    },
  ],
  warranty: [
    {
      q: "What does the warranty cover?",
      a: "Every product carries its brand's official warranty. The period depends on the brand and the product — from 1 year, up to 5–10 years for some brands such as Lahore Fan. Coverage and terms are set by each brand.",
    },
    {
      q: "How do I claim warranty service?",
      a: "Contact us with your invoice or order number and a short description of the fault. We register the complaint with the brand's official service centre on your behalf, or guide you to the brand's direct support. Repairs are carried out by the brand's authorised technicians.",
    },
    {
      q: "What voids the warranty?",
      a: "This is set by each brand, but it typically excludes physical damage, water damage, repairs by unauthorised technicians, and use outside the rated voltage. Ask us and we will check the terms for your product.",
    },
  ],
  service: [
    {
      q: "Do you provide installation?",
      a: "Products come with the brand's installation kit and instructions, which any qualified electrician can follow. Our team is happy to advise on the right setup for your space.",
    },
    {
      q: "Where are the service centres?",
      a: "After-sales service is provided by each brand's official service centres across Pakistan. Tell us your product and city and we will point you to the nearest one — or register the complaint for you.",
    },
    {
      q: "Can I buy spare parts separately?",
      a: "Spare parts are supplied by the brands. Share your product model and we will help you get the part through the brand's official channel.",
    },
  ],
};

/** "Why choose us" — used on the About page and the homepage. */
export const CORE_ETHOS = [
  {
    title: "Brand Variety",
    body: "An authorized collection of Pakistan's top national brands, covering every design, colour and budget — so you can compare and choose in one place.",
  },
  {
    title: "Affordability",
    body: "Premium-quality products at prices that work for every customer. As a retailer and wholesaler, we pass the savings on to you.",
  },
  {
    title: "Expert Guidance",
    body: "Well-trained sales staff and technicians help you from choosing the right product to support after you buy.",
  },
  {
    title: "Seamless Warranty Bridge",
    body: "We are your reliable point of contact with the brands' service centres — during the warranty period and after it.",
  },
  {
    title: "Genuine Products Only",
    body: "As an authorized dealer, retailer and wholesaler, everything we sell comes through official brand channels, with the brand's own warranty.",
  },
  {
    // The founding year stays on the About page, where the full story gives it
    // context; elsewhere the site states what the business is today.
    title: "Trusted by Generations",
    body: "Generations of Pakistani families have bought their fans and home appliances from Metro Electric Co.",
  },
];
