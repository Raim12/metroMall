/**
 * The first LEGENDS models, previewed on /legends before the range goes on
 * sale.
 *
 * These are not catalogue products: LEGENDS has not launched, so there is no
 * stock, no cart and no checkout for them. They exist here so the teaser page
 * can show what is coming and what it will cost, with enquiries going to
 * WhatsApp.
 *
 * `price` is the list price and `salePrice` what it sells for at launch; omit
 * `salePrice` and the card shows a single figure. Omit `image` and the card
 * shows a "photo coming" placeholder rather than a broken frame, so a model
 * can be listed before its photography arrives.
 *
 * `video` plays in place of the still where one exists - for a fan whose
 * blades fold away, a loop shows in two seconds what a photograph cannot. The
 * still is still required: it is the poster frame, so the card is never empty
 * while the video loads or if it fails to play.
 */
export type LegendsPreview = {
  slug: string;
  name: string;
  blurb: string;
  price?: number;
  salePrice?: number;
  image?: string;
  video?: string;
};

export const LEGENDS_PREVIEW: LegendsPreview[] = [
  {
    slug: "chandelier-fan",
    name: "Chandelier Fan",
    blurb:
      "Retractable-blade chandelier fan in rose gold, with a tiered crystal drop and warm integrated lighting. The blades fold away when it is off, so it reads as a chandelier.",
    price: 48000,
    salePrice: 43000,
    image: "/legends/chandelier-fan.webp",
    video: "/legends/chandelier-fan.mp4",
  },
  {
    slug: "wooden-blade-fan",
    name: "Wooden Blade Ceiling Fan",
    blurb:
      "Five wooden blades on an antique brass fitting, with a frosted glass light bowl at the centre — a ceiling fan and a light in one.",
    image: "/legends/wooden-blade-fan.webp",
  },
];
