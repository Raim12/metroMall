/**
 * Seed source for the catalogue.
 *
 * This is the hand-written product data that Phase 1 rendered directly. It now
 * exists only to populate the database via `prisma/seed.ts`; the app reads
 * products from Postgres through src/lib/products.ts.
 *
 * Replacing this with Metro's real catalogue is a content task, not a code one:
 * edit the array, re-run `npm run db:seed`.
 */
import type { Product, ProductColor } from "../src/types";

const COLORS = {
  onyx: { name: "Onyx Black", hex: "#1f2224", trim: "#c9a227" },
  graphite: { name: "Graphite Copper", hex: "#2b2320", trim: "#b87333" },
  pearl: { name: "Pearl White", hex: "#f2f5f6", trim: "#cbd5da" },
  ivory: { name: "Ivory Gold", hex: "#ece0c4", trim: "#d4af37" },
  walnut: { name: "Walnut Brown", hex: "#5a3a28", trim: "#c08552" },
  teal: { name: "Metro Teal", hex: "#0f766e", trim: "#facc15" },
  steel: { name: "Brushed Steel", hex: "#9aa5ac", trim: "#e2e8ec" },
} satisfies Record<string, ProductColor>;

const INVERTER_SPECS = [
  { speed: 1, watts: 3, rpm: 125 },
  { speed: 2, watts: 10, rpm: 200 },
  { speed: 3, watts: 20, rpm: 260 },
  { speed: 4, watts: 30, rpm: 320 },
  { speed: 5, watts: 38, rpm: 345 },
  { speed: 6, watts: 45, rpm: 365 },
];

const BLDC_FEATURES: Product["features"] = [
  {
    icon: "wind",
    title: "Advanced BLDC/PMSM Motor",
    body: "Our proprietary brushless DC motor delivers powerful airflow with minimal energy consumption and near-silent operation. The brushless design removes friction inside the motor, which means almost no heat build-up and an exponentially longer service life.",
  },
  {
    icon: "camera",
    title: "Sleek Modern Design",
    body: "Crafted from premium die-cast aluminium and high-grade polymers, the chassis is as considered as it is durable â€” finished by hand and inspected under light before it ships.",
  },
  {
    icon: "play",
    title: "Smart Controls",
    body: "Intuitive remote control with timer, boost and six speed settings for precise comfort in any room, plus memory that restores your last setting after a power cut.",
  },
  {
    icon: "shield",
    title: "Built to Last",
    body: "Rigorous quality testing ensures a robust product that withstands voltage swings, dust and continuous summer duty cycles. The word of mouth speaks for itself.",
  },
];

const STANDARD_BOX = [
  "1x Fan",
  "Premium Remote Control",
  "Mounting Hardware",
  "User Manual",
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "metro-nitro-inverter",
    name: "Metro Nitro Inverter",
    tagline: "The all-rounder of the E-Force line-up",
    description:
      "A key player in our new E-Force Inverter line-up. Putting the innovation on nitro power â€” leading in air delivery and energy efficiency with unmatched aesthetics. NITRO is our jack of all trades model, a universal answer to every environment, but beware: it will be talked about more than anything else in its surroundings.",
    price: 12600,
    compareAtPrice: 14200,
    category: "ceiling-fans",
    sizes: ['56"', '48"'],
    colors: [COLORS.onyx, COLORS.graphite, COLORS.ivory, COLORS.walnut],
    illustration: "ceiling-3",
    badge: "Best Seller",
    rating: 4.8,
    reviewCount: 42,
    features: BLDC_FEATURES,
    specs: INVERTER_SPECS,
    inTheBox: STANDARD_BOX,
    featured: true,
  },
  {
    id: "2",
    slug: "metro-majesty-inverter",
    name: "Metro Majesty Inverter",
    tagline: "The King model's inverter successor",
    description:
      "The King model's inverter successor, bearing the same outline but an entirely different soul. Majesty is quickly climbing the ranks to meet its predecessor's reputation as an incredibly attractive, robust machine that holds its own identity for years to come.",
    price: 12800,
    category: "ceiling-fans",
    sizes: ['56"', '48"'],
    colors: [COLORS.onyx, COLORS.ivory, COLORS.graphite, COLORS.walnut],
    illustration: "ceiling-3",
    badge: "Premium Collection",
    rating: 5,
    reviewCount: 31,
    features: BLDC_FEATURES,
    specs: INVERTER_SPECS,
    inTheBox: STANDARD_BOX,
    featured: true,
  },
  {
    id: "3",
    slug: "metro-astro-inverter",
    name: "Metro Astro Inverter",
    tagline: "Our flagship. A fan in a suit.",
    description:
      "Our flagship design in the E-Force Inverter Series. This is a fan in a suit, basically. Unmatched class, unmatched efficiency, unmatched airflow. Notorious for integrating itself into any room it is installed in so completely that some may think the room was built for the fan, not the other way around.",
    price: 13000,
    category: "ceiling-fans",
    sizes: ['56"', '48"'],
    colors: [COLORS.graphite, COLORS.onyx, COLORS.pearl, COLORS.ivory],
    illustration: "ceiling-3",
    badge: "Flagship",
    rating: 4.9,
    reviewCount: 58,
    features: BLDC_FEATURES,
    specs: INVERTER_SPECS,
    inTheBox: STANDARD_BOX,
    featured: true,
  },
  {
    id: "4",
    slug: "metro-penta-inverter",
    name: "Metro Penta Inverter",
    tagline: "Five blades of designer elegance",
    description:
      "A dash of elegance amalgamated with power, performance, comfort, safety and durability. The Metro Designer Series ceiling fans are an imperative part of every home and are built to be energy efficient. Add a sense of style and exuberance to your rooms and offices with our innovative and trend-setting range.",
    price: 27000,
    category: "ceiling-fans",
    sizes: ['56"'],
    colors: [COLORS.walnut, COLORS.ivory, COLORS.onyx],
    illustration: "ceiling-5",
    badge: "Designer Series",
    rating: 4.7,
    reviewCount: 19,
    features: BLDC_FEATURES,
    specs: INVERTER_SPECS,
    inTheBox: STANDARD_BOX,
    featured: true,
  },
  {
    id: "5",
    slug: "metro-regal-ac-dc",
    name: "Metro Regal AC/DC",
    tagline: "Runs on mains or solar, without a stabiliser",
    description:
      "The Metro Regal AC/DC Inverter Ceiling Fan comes with a highly efficient BLDC motor that consumes only 50W at the highest speed. Our energy-saving fans are DC motor based, designed to ensure minimal power consumption and capable of converting a small amount of energy into the airflow you actually need.",
    price: 11500,
    category: "ceiling-fans",
    sizes: ['56"', '48"'],
    colors: [COLORS.walnut, COLORS.ivory, COLORS.onyx, COLORS.graphite],
    illustration: "ceiling-3",
    rating: 4.6,
    reviewCount: 27,
    features: BLDC_FEATURES,
    specs: [
      { speed: 1, watts: 4, rpm: 130 },
      { speed: 2, watts: 12, rpm: 205 },
      { speed: 3, watts: 22, rpm: 265 },
      { speed: 4, watts: 34, rpm: 320 },
      { speed: 5, watts: 50, rpm: 360 },
    ],
    inTheBox: [...STANDARD_BOX, "12V DC Input Harness"],
  },
  {
    id: "6",
    slug: "metro-classic-ac-220v",
    name: "Metro Classic AC 220V",
    tagline: "Trusted by millions. Proven by time.",
    description:
      "Trusted by millions. Proven by time. The classic Pakistani fan, built for lasting quality â€” a copper-wound induction motor, a heavy-gauge chassis and a finish that survives a decade of summers. No electronics to fail, nothing to configure.",
    price: 8900,
    category: "ceiling-fans",
    sizes: ['56"'],
    colors: [COLORS.pearl, COLORS.ivory],
    illustration: "ceiling-3",
    rating: 4.5,
    reviewCount: 88,
    features: [
      {
        icon: "shield",
        title: "Pure Copper Winding",
        body: "99.99% pure copper windings keep the motor cool and hold rated RPM season after season.",
      },
      {
        icon: "zap",
        title: "Wide Voltage Tolerance",
        body: "Keeps turning between 140V and 260V, so it rides out the voltage swings common on rural feeders.",
      },
      {
        icon: "camera",
        title: "Timeless Finish",
        body: "Powder-coated in a classic ivory and gold scheme that suits any Pakistani home.",
      },
      {
        icon: "play",
        title: "Regulator Friendly",
        body: "Works with any standard fan regulator or dimmer already installed in your home.",
      },
    ],
    specs: [
      { speed: 1, watts: 62, rpm: 180 },
      { speed: 2, watts: 78, rpm: 235 },
      { speed: 3, watts: 94, rpm: 285 },
      { speed: 4, watts: 108, rpm: 320 },
      { speed: 5, watts: 119, rpm: 350 },
    ],
    inTheBox: ["1x Fan", "Down Rod & Canopy", "Mounting Hardware", "User Manual"],
  },
  {
    id: "7",
    slug: "metro-sapphire-designer",
    name: "Metro Sapphire Designer",
    tagline: "Eight blades across a 60-inch span",
    description:
      "The Sapphire elevates premium interiors with an expansive 60-inch span and an elegant eight-blade design. Combining superior airflow with a sophisticated wood-inspired finish, it delivers a harmonious balance of luxury and performance, complete with an integrated centre light for enhanced ambience.",
    price: 32000,
    category: "ceiling-fans",
    sizes: ['60"'],
    colors: [COLORS.walnut, COLORS.onyx, COLORS.ivory],
    illustration: "ceiling-8",
    badge: "Aeris Series",
    rating: 4.9,
    reviewCount: 12,
    features: BLDC_FEATURES,
    specs: INVERTER_SPECS,
    inTheBox: [...STANDARD_BOX, "Integrated LED Light Module"],
  },
  {
    id: "8",
    slug: "metro-flex-inverter-pedestal",
    name: "Metro Flex Inverter",
    tagline: "Stay cool without the noise",
    description:
      "Stay cool without the noise. This lightweight pedestal fan runs on just 35 watts for efficient, energy-saving performance. It features smooth touch controls for speed and mode adjustment, and is engineered for quiet operation so you can work, sleep or relax without distraction. Built to be lightweight and easy to move, it goes wherever the heat does.",
    price: 14500,
    category: "pedestal-fans",
    sizes: ['18"'],
    colors: [COLORS.onyx, COLORS.pearl],
    illustration: "pedestal",
    badge: "New",
    rating: 4.7,
    reviewCount: 23,
    features: [
      {
        icon: "wind",
        title: "35W BLDC Motor",
        body: "Delivers full pedestal airflow at a third of the power draw of a conventional 120W stand fan.",
      },
      {
        icon: "play",
        title: "Touch + Remote Control",
        body: "Capacitive touch panel on the head plus a full-function remote with sleep, natural and boost modes.",
      },
      {
        icon: "battery",
        title: "Inverter & UPS Ready",
        body: "Low draw means hours of runtime from a modest UPS or solar bank during load-shedding.",
      },
      {
        icon: "shield",
        title: "Stable, Weighted Base",
        body: "A low-centre-of-gravity base and height-adjustable column keep it steady at full speed.",
      },
    ],
    specs: [
      { speed: 1, watts: 5, rpm: 380 },
      { speed: 2, watts: 11, rpm: 640 },
      { speed: 3, watts: 18, rpm: 900 },
      { speed: 4, watts: 26, rpm: 1120 },
      { speed: 5, watts: 35, rpm: 1300 },
    ],
    inTheBox: [
      "1x Pedestal Fan",
      "Remote Control",
      "Base & Column Assembly",
      "User Manual",
    ],
    featured: true,
  },
  {
    id: "9",
    slug: "metro-storm-pedestal",
    name: "Metro Storm Pedestal",
    tagline: "Heavy-duty air for workshops and halls",
    description:
      "Built for spaces where airflow matters more than subtlety. The Storm moves a large volume of air across workshops, godowns and event halls, with a metal guard, a heavy tripod base and a motor rated for continuous duty.",
    price: 9800,
    category: "pedestal-fans",
    sizes: ['24"', '18"'],
    colors: [COLORS.onyx, COLORS.steel],
    illustration: "pedestal",
    rating: 4.4,
    reviewCount: 16,
    features: [
      {
        icon: "wind",
        title: "High-Volume Airflow",
        body: "Aluminium blades and a wide pitch push air the length of a workshop bay.",
      },
      {
        icon: "shield",
        title: "Continuous Duty Motor",
        body: "Thermally protected and rated for all-day operation in hot industrial conditions.",
      },
      {
        icon: "zap",
        title: "Metal Guard & Frame",
        body: "Full steel guard and tripod base stand up to knocks on a busy floor.",
      },
      {
        icon: "play",
        title: "Manual Tilt & Oscillation",
        body: "Lockable tilt head with switchable oscillation directs air exactly where it is needed.",
      },
    ],
    specs: [
      { speed: 1, watts: 55, rpm: 700 },
      { speed: 2, watts: 82, rpm: 1000 },
      { speed: 3, watts: 110, rpm: 1350 },
    ],
    inTheBox: ["1x Pedestal Fan", "Tripod Base", "Assembly Tools", "User Manual"],
  },
  {
    id: "10",
    slug: "metro-vent-exhaust-12",
    name: 'Metro Vent Exhaust 12"',
    tagline: "Clears a kitchen in minutes",
    description:
      "A high-extraction exhaust fan for kitchens and washrooms. Auto-opening louvre shutters keep insects and back-draft out when the fan is off, and the sealed motor housing resists grease and steam.",
    price: 4200,
    category: "exhaust-fans",
    sizes: ['12"', '10"'],
    colors: [COLORS.pearl, COLORS.steel],
    illustration: "exhaust",
    rating: 4.5,
    reviewCount: 34,
    features: [
      {
        icon: "wind",
        title: "High Extraction Rate",
        body: "Angled blade pitch clears smoke, steam and odour from a standard kitchen in minutes.",
      },
      {
        icon: "shield",
        title: "Auto Louvre Shutters",
        body: "Shutters open on start and close on stop, blocking back-draft, dust and insects.",
      },
      {
        icon: "zap",
        title: "Sealed Motor Housing",
        body: "Grease- and steam-resistant housing keeps the windings clean and extends motor life.",
      },
      {
        icon: "camera",
        title: "Easy-Clean Front",
        body: "The front grille unclips without tools so the blades can be wiped down in seconds.",
      },
    ],
    specs: [
      { speed: 1, watts: 28, rpm: 1150 },
      { speed: 2, watts: 40, rpm: 1400 },
    ],
    inTheBox: ["1x Exhaust Fan", "Louvre Shutter Assembly", "Fixing Screws", "User Manual"],
  },
  {
    id: "11",
    slug: "metro-vent-pro-exhaust-14",
    name: 'Metro Vent Pro Exhaust 14"',
    tagline: "Commercial extraction for busy kitchens",
    description:
      "The Vent Pro steps up to a 14-inch aperture and a heavier motor for commercial kitchens, laundries and workshops. Metal body, replaceable bearings, and a grille sized for standard ducting.",
    price: 5400,
    category: "exhaust-fans",
    sizes: ['14"'],
    colors: [COLORS.steel, COLORS.pearl],
    illustration: "exhaust",
    rating: 4.6,
    reviewCount: 11,
    features: [
      {
        icon: "wind",
        title: "Commercial Airflow",
        body: "A 14-inch aperture moves substantially more air than a domestic exhaust.",
      },
      {
        icon: "shield",
        title: "All-Metal Body",
        body: "Powder-coated steel body and guard, built for commercial kitchen conditions.",
      },
      {
        icon: "zap",
        title: "Serviceable Bearings",
        body: "Replaceable sealed bearings mean the unit can be refreshed rather than replaced.",
      },
      {
        icon: "camera",
        title: "Standard Duct Fit",
        body: "Sized to mate with common 14-inch ducting and wall sleeves without an adaptor.",
      },
    ],
    specs: [
      { speed: 1, watts: 45, rpm: 1100 },
      { speed: 2, watts: 68, rpm: 1380 },
    ],
    inTheBox: ["1x Exhaust Fan", "Mounting Frame", "Fixing Screws", "User Manual"],
  },
  {
    id: "12",
    slug: "metro-aura-false-ceiling",
    name: "Metro Aura False Ceiling",
    tagline: "Flush-mount cassette fan with LED ring",
    description:
      "Designed to sit flush in a false ceiling grid, the Aura hides its motor entirely and pushes air down through a slim diffuser. An integrated LED ring provides ambient light, making it ideal for offices, salons and modern living rooms with limited headroom.",
    price: 7600,
    category: "false-ceiling-fans",
    sizes: ['24" x 24"'],
    colors: [COLORS.pearl, COLORS.steel],
    illustration: "false-ceiling",
    rating: 4.3,
    reviewCount: 9,
    features: [
      {
        icon: "camera",
        title: "Flush Cassette Design",
        body: "Drops into a standard 2x2 false-ceiling grid with no visible motor or down-rod.",
      },
      {
        icon: "zap",
        title: "Integrated LED Ring",
        body: "Soft, even ambient light around the diffuser â€” one fixture instead of two.",
      },
      {
        icon: "wind",
        title: "Downward Diffusion",
        body: "Directs air straight down through a slim diffuser, ideal for low ceilings.",
      },
      {
        icon: "play",
        title: "Remote Operated",
        body: "Fan speed and light brightness are both controlled from the supplied remote.",
      },
    ],
    specs: [
      { speed: 1, watts: 12, rpm: 340 },
      { speed: 2, watts: 22, rpm: 520 },
      { speed: 3, watts: 34, rpm: 690 },
    ],
    inTheBox: ["1x Cassette Fan", "Remote Control", "Grid Mounting Kit", "User Manual"],
  },
  {
    id: "13",
    slug: "metro-gale-bracket-fan",
    name: "Metro Gale Bracket Fan",
    tagline: "Wall-mounted power for shops and halls",
    description:
      "A wall-mounted bracket fan that frees up floor space while covering a wide arc. Built for shops, mosques, factories and wedding halls, with a robust oscillation gearbox and a pull-cord or remote option.",
    price: 8200,
    category: "bracket-fans",
    sizes: ['18"', '16"'],
    colors: [COLORS.onyx, COLORS.steel, COLORS.pearl],
    illustration: "bracket",
    rating: 4.4,
    reviewCount: 21,
    features: [
      {
        icon: "wind",
        title: "Wide Oscillation Arc",
        body: "Covers a broad seating area from a single wall position, leaving the floor clear.",
      },
      {
        icon: "shield",
        title: "Heavy-Duty Gearbox",
        body: "Metal oscillation gearbox rated for long daily duty cycles in commercial spaces.",
      },
      {
        icon: "zap",
        title: "Secure Wall Bracket",
        body: "Thick steel bracket with four anchor points holds firm even at full speed.",
      },
      {
        icon: "play",
        title: "Pull-Cord or Remote",
        body: "Choose a simple three-speed pull cord or the remote-controlled variant.",
      },
    ],
    specs: [
      { speed: 1, watts: 48, rpm: 780 },
      { speed: 2, watts: 72, rpm: 1050 },
      { speed: 3, watts: 95, rpm: 1300 },
    ],
    inTheBox: ["1x Bracket Fan", "Wall Bracket & Anchors", "Pull Cord", "User Manual"],
  },
  {
    id: "14",
    slug: "metro-lumen-socket-fan",
    name: "Metro Lumen",
    tagline: "A fan and a lamp in one socket",
    description:
      "The Metro Lumen is a 2-in-1 device that combines a compact ceiling fan and a bright LED light in a single unit, fitting into a standard E27/E26 light socket for wireless installation. It comes with a remote to adjust colour temperature from 3000K to 6500K and brightness up to 1500 lumens, plus a memory function.",
    price: 6900,
    category: "ceiling-fans",
    sizes: ['20.5"'],
    colors: [COLORS.pearl],
    illustration: "socket-light",
    badge: "2-in-1",
    rating: 4.2,
    reviewCount: 15,
    features: [
      {
        icon: "zap",
        title: "Screws Into Any E27 Socket",
        body: "No wiring, no ceiling hook â€” it installs into an existing bulb holder in under a minute.",
      },
      {
        icon: "camera",
        title: "3000K â€“ 6500K Light",
        body: "Dial the colour temperature from warm to daylight, up to 1500 lumens.",
      },
      {
        icon: "wind",
        title: "Retractable Blades",
        body: "Blades fold away when the fan is off, leaving a clean light fixture.",
      },
      {
        icon: "play",
        title: "Memory Function",
        body: "Remembers your last light and fan setting after a power interruption.",
      },
    ],
    specs: [
      { speed: 1, watts: 8, rpm: 220 },
      { speed: 2, watts: 15, rpm: 340 },
      { speed: 3, watts: 24, rpm: 450 },
    ],
    inTheBox: ["1x Lumen Unit", "Remote Control", "Socket Adaptor", "User Manual"],
  },
];
