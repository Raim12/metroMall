/**
 * The product showcase rail on the homepage.
 *
 * Photographs of models we stock, sourced from each brand's own website and
 * normalised to a 600x600 white-backed WebP in `public/showcase/`. The
 * `source` field records where each one came from, so a photo can be traced
 * back or refreshed when a brand updates its catalogue.
 *
 * This is a visual showcase, not the catalogue: the rail is not clickable and
 * carries no prices. Products for sale live in the database.
 */
export type ShowcaseItem = {
  brand: string;
  model: string;
  image: string;
  source: string;
};

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  { brand: "Pak Fan", model: "Prism", image: "/showcase/pak-fans-prism.webp", source: "https://www.pakfansofficial.com/public/resources/img/og/prism_black.jpg" },
  { brand: "Pak Fan", model: "Elegance", image: "/showcase/pak-fans-elegance.webp", source: "https://www.pakfansofficial.com/public/resources/img/og/elegance.jpg" },
  { brand: "Pak Fan", model: "Floral Classic", image: "/showcase/pak-fans-floral.webp", source: "https://www.pakfansofficial.com/public/resources/img/og/floral_off_white.jpg" },
  { brand: "Pak Fan", model: "Smart White", image: "/showcase/pak-fans-smart.webp", source: "https://www.pakfansofficial.com/public/resources/img/og/smart_white.jpg" },
  { brand: "Luxus by Pak Fan", model: "LX-800 8-Blade", image: "/showcase/luxus-lx-800.webp", source: "Luxus Product Catalogue 2026 (PDF supplied by the client)" },
  { brand: "Luxus by Pak Fan", model: "LX-300L 3-Blade", image: "/showcase/luxus-lx-300l.webp", source: "Luxus Product Catalogue 2026 (PDF supplied by the client)" },
  { brand: "Royal", model: "Monarch iTurbo", image: "/showcase/royal-monarch.webp", source: "https://cdn.shopify.com/s/files/1/0326/1923/3339/files/Untitled_design_20.jpg" },
  { brand: "Royal", model: "Splendor iTurbo", image: "/showcase/royal-splendor.webp", source: "https://cdn.shopify.com/s/files/1/0326/1923/3339/files/Untitleddesign_76.jpg" },
  { brand: "Royal", model: "Ornament iTurbo", image: "/showcase/royal-ornament.webp", source: "https://cdn.shopify.com/s/files/1/0326/1923/3339/files/Untitleddesign_14.jpg" },
  { brand: "Royal", model: "Passion Magnum", image: "/showcase/royal-passion.webp", source: "https://cdn.shopify.com/s/files/1/0326/1923/3339/files/Untitleddesign_57_feb2646e-8300-4f71-b758-82a987de0d17.jpg" },
  { brand: "GFC", model: "Palace Plus", image: "/showcase/gfc-palace-plus.webp", source: "https://cdn.shopify.com/s/files/1/0625/0332/1687/files/palaceplus1.jpg" },
  { brand: "GFC", model: "Fanoos", image: "/showcase/gfc-fanoos.webp", source: "https://cdn.shopify.com/s/files/1/0625/0332/1687/files/DesignerSeries-1-13.jpg" },
  { brand: "GFC", model: "Ovate", image: "/showcase/gfc-ovate.webp", source: "https://cdn.shopify.com/s/files/1/0625/0332/1687/files/OVATEDARKWOODSILVER.jpg" },
  { brand: "GFC", model: "Ravi Plus", image: "/showcase/gfc-ravi-plus.webp", source: "https://cdn.shopify.com/s/files/1/0625/0332/1687/files/RAVIPLUSOFFWHITEDARKWOOD.jpg" },
  { brand: "SK", model: "Iris", image: "/showcase/sk-iris.webp", source: "https://www.skfans.com.pk/wp-content/uploads/2024/03/Iris-A-1.jpg" },
  { brand: "SK", model: "Grace", image: "/showcase/sk-grace.webp", source: "https://www.skfans.com.pk/wp-content/uploads/2024/03/Grace-Black-A-2.jpg" },
  { brand: "SK", model: "Magnum", image: "/showcase/sk-magnum.webp", source: "https://www.skfans.com.pk/wp-content/uploads/2023/05/Magnum-White-Black-202-2-3.jpg" },
  { brand: "SK", model: "Super Deluxe Multi", image: "/showcase/sk-super-deluxe.webp", source: "https://www.skfans.com.pk/wp-content/uploads/2023/05/Super-Deluxe-Multi-8171-3.jpg" },
  { brand: "Tamoor", model: "Diamond", image: "/showcase/tamoor-diamond.webp", source: "https://cdn.shopify.com/s/files/1/0856/7767/0720/files/DSC_0384.png" },
  { brand: "Tamoor", model: "Magnum", image: "/showcase/tamoor-magnum.webp", source: "https://cdn.shopify.com/s/files/1/0856/7767/0720/files/DSC_0383-3.png" },
  { brand: "Tamoor", model: "Super Pearl", image: "/showcase/tamoor-pearl.webp", source: "https://cdn.shopify.com/s/files/1/0856/7767/0720/files/DSC_0819.png" },
  { brand: "Tamoor", model: "Executive", image: "/showcase/tamoor-executive.webp", source: "https://cdn.shopify.com/s/files/1/0856/7767/0720/files/executive.png" },
  { brand: "Orient", model: "Top Speed", image: "/showcase/orient-top-speed.webp", source: "https://orient-images.s3.eu-north-1.amazonaws.com/products/top-speed-wood-oak-dual-option-30-watt-fan-orient-appliances-1728371952-image-1791364370.jpeg" },
  { brand: "Orient", model: "Magnum", image: "/showcase/orient-magnum.webp", source: "https://orient-images.s3.eu-north-1.amazonaws.com/products/magnum-off-white-30-watts-inverter-dark-wood-image-0-6ac50715f3070.jpeg" },
  { brand: "Orient", model: "Gulf", image: "/showcase/orient-gulf.webp", source: "https://orient-images.s3.eu-north-1.amazonaws.com/products/gulf-30w-inverter-ceiling-fan-orient-appliances-1739536824-image-0-6ac62d725f818.jpeg" },
  { brand: "Voldam", model: "False Ceiling 2x2 18\"", image: "/showcase/voldam-false-18.webp", source: "https://cdn.shopify.com/s/files/1/0790/3536/7727/files/VoldamInverterFan18.jpg" },
  { brand: "Voldam", model: "False Ceiling 2x2 14\"", image: "/showcase/voldam-false-14.webp", source: "https://cdn.shopify.com/s/files/1/0790/3536/7727/files/3_7146b7f1-8049-4d9e-911a-b105902b1de4.jpg" },
  { brand: "Voldam", model: "Air Circulating 14\"", image: "/showcase/voldam-air-circulating.webp", source: "https://cdn.shopify.com/s/files/1/0790/3536/7727/files/VoldamAirCirculatingFan_15b720eb-d84c-4955-8c9a-e85ea0f184eb.jpg" },
  { brand: "Voldam", model: "Exhaust BD Series", image: "/showcase/voldam-exhaust-bd.webp", source: "https://cdn.shopify.com/s/files/1/0790/3536/7727/files/VoldamVentilationFan_575df346-f493-42c7-8194-eab30b6d1051.jpg" },
  { brand: "Voldam", model: "Exhaust VF-N6 6\"", image: "/showcase/voldam-exhaust-n6.webp", source: "https://cdn.shopify.com/s/files/1/0790/3536/7727/files/6inchexhaustfanpriceinpakistan.jpg" },
  { brand: "Super Asia", model: "SA-240 Shower Wash", image: "/showcase/super-asia-sa-240.webp", source: "https://cdn.shopify.com/s/files/1/0599/9116/2933/files/1_0f8b931b-1c4d-4f28-b4c0-d8da67eef6b1.jpg" },
  { brand: "Super Asia", model: "ECM-4500 Plus Cooler", image: "/showcase/super-asia-ecm-4500.webp", source: "https://cdn.shopify.com/s/files/1/0599/9116/2933/files/DC_12V_04.webp" },
  { brand: "Super Asia", model: "SEH-16 Electric Geyser", image: "/showcase/super-asia-seh-16.webp", source: "https://cdn.shopify.com/s/files/1/0599/9116/2933/files/1_f0184686-fe82-467e-a57e-83a5f69f92d1.jpg" },
  { brand: "Super Asia", model: "GH-206 Di Instant Geyser", image: "/showcase/super-asia-gh-206di.webp", source: "https://cdn.shopify.com/s/files/1/0599/9116/2933/files/07-_GH-206Di.jpg" },
  { brand: "Super Asia", model: "GEH-735 Ai Geyser", image: "/showcase/super-asia-geh-735ai.webp", source: "https://cdn.shopify.com/s/files/1/0599/9116/2933/products/36-GEH-735Ai.jpg" },
  { brand: "Jackpot", model: "JP-7991 Washing Machine", image: "/showcase/jackpot-jp-7991.webp", source: "https://cdn.shopify.com/s/files/1/0726/3541/6891/files/jackpot-jp-7991-single-tub-washing-machine_22dc7fab-a071-4753-9b27-4e4053790475.webp" },
  { brand: "Jackpot", model: "JP-9500 Air Cooler", image: "/showcase/jackpot-jp-9500.webp", source: "https://cdn.shopify.com/s/files/1/0726/3541/6891/files/jackpot-jp-9500-super-size-air-room-cooler-a-c_6e2ca4aa-c124-4fae-ba7f-0bec10163a8d.webp" },
  { brand: "Jackpot", model: "JP-180 Juicer Blender", image: "/showcase/jackpot-jp-180.webp", source: "https://cdn.shopify.com/s/files/1/0726/3541/6891/files/jackpot-jp-180-juicer-blender-and-mixer_49617f47-756d-4d63-b7b6-257d645559a8.webp" },
  { brand: "Jackpot", model: "JP-976 Toaster", image: "/showcase/jackpot-jp-976.webp", source: "https://cdn.shopify.com/s/files/1/0726/3541/6891/files/jackpot-jp-976-2-slice-toaster-white_d40ee478-daa9-47fe-a41e-2c150fbb4e67.webp" },
  { brand: "West Point", model: "WF-152 Ceramic Cooker", image: "/showcase/westpoint-wf-152.webp", source: "https://cdn.shopify.com/s/files/1/0726/3541/6891/files/westpoint-deluxe-ceramic-cooker-wf-152.webp" },
  { brand: "West Point", model: "WF-3117 Cordless Kettle", image: "/showcase/westpoint-wf-3117.webp", source: "https://cdn.shopify.com/s/files/1/0726/3541/6891/files/westpoint-wf-3117-cordless-kettle.webp" },
  { brand: "West Point", model: "WF-3040 Meat Grinder", image: "/showcase/westpoint-wf-3040.webp", source: "https://cdn.shopify.com/s/files/1/0726/3541/6891/files/westpoint-wf-3040-meat-grinder.webp" },
  { brand: "Starco", model: "Opal", image: "/showcase/starco-opal.webp", source: "https://pakistantradeportal.gov.pk/storage/product_images/627d1930e51201652365616.webp" },
  { brand: "Starco", model: "Magnum", image: "/showcase/starco-magnum.webp", source: "https://pakistantradeportal.gov.pk/storage/product_images/6231a1c3b05671647419843.jpg" },
  { brand: "Starco", model: "Supreme", image: "/showcase/starco-supreme.webp", source: "https://pakistantradeportal.gov.pk/storage/product_images/627d1ec0a63911652367040.jpg" },
  { brand: "Starco", model: "New Pak", image: "/showcase/starco-new-pak.webp", source: "https://pakistantradeportal.gov.pk/storage/product_images/627d1f17582531652367127.jpg" },
];
