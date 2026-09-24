# Metro Electric Co. — Storefront

A modern, light-themed e-commerce front end for **Metro Electric Co.**, a Pakistani
manufacturer of high-efficiency BLDC / inverter fans. Structure mirrors
[khurshidfans.com](https://khurshidfans.com) with a lighter, more contemporary
treatment: whites and light greys, teal/emerald accents, yellow CTAs.

**Phase 1 (this repo state) is complete** — the full static front end.
Phase 2 adds Prisma/PostgreSQL, the cart-to-order pipeline, Pakistani payment
gateways and transactional email.

---

## Stack

| Concern    | Choice                                                |
| ---------- | ----------------------------------------------------- |
| Framework  | Next.js 15.5 (App Router) · React 19 · TypeScript     |
| Styling    | Tailwind CSS v4 · shadcn/ui (Radix, `new-york` style) |
| Icons      | lucide-react                                          |
| Animation  | Framer Motion                                         |
| State      | Zustand (+ `persist`)                                 |
| Forms      | React Hook Form + Zod                                 |
| Toasts     | Sonner                                                |

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # eslint
```

---

## What's in Phase 1

### Global layout

- **Navbar** — sticky, `backdrop-blur`, shrinks on scroll. Logo left, links
  centre (Support has a hover dropdown), cart right with a live Zustand item
  badge that spring-animates on change. Full mobile drawer.
- **Cart drawer** — shadcn `Sheet`, opens on add-to-cart, animated line items
  (`AnimatePresence`), quantity steppers, PKR subtotal, checkout CTA.
- **Footer** — dark teal, logo + three link columns, contact details, embedded
  Google Map, social icons.
- **Floating** — WhatsApp button (pulse ring) and a scroll-to-top button that
  appears past 480px.

### Pages

| Route               | Contents                                                                    |
| ------------------- | --------------------------------------------------------------------------- |
| `/`                 | Hero slider, tech split-screen, savings stats, categories, best sellers, BLDC section, FAQ accordion, CTA, certifications |
| `/catalogue`        | Search, category filter chips, sort, responsive product grid, empty state    |
| `/product/[slug]`   | Colour-switching gallery + thumbnails, qty stepper, Size/Colour `Select`s, Overview/Specs `Tabs`, related products |
| `/about`            | Mission block, milestone stats, 6-card Core Ethos grid                       |
| `/export`           | Contact card + WhatsApp, validated inquiry form                             |
| `/join-us`          | Multi-section job application with resume upload (type + 1 MB validation)   |
| `/support/faq`      | Tabbed FAQs (Difference / Warranty / Service) + support form                |
| `/support/contact`  | Contact channel cards + message form                                        |
| `/checkout`         | Order summary + payment-method preview (gateway is Phase 2)                 |
| `/policies/[slug]`  | privacy · returns · delivery · terms                                        |

### Product artwork

There is no photography yet, so every product renders as a **parametric SVG**
(`src/components/product/fan-illustration.tsx`) driven by its colourway — so the
colour swatches on the catalogue and product pages change the actual image.
Eight variants: 3/5/8-blade ceiling, pedestal, exhaust, false-ceiling cassette,
bracket and socket-light.

**To swap in real photos:** set `images: string[]` on a `Product` and render an
`<Image>` where the illustration is used — the type field already exists.

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx            navbar · footer · cart · toaster · fonts
│  ├─ page.tsx              home
│  ├─ catalogue/ product/[slug]/ about/ export/ join-us/
│  ├─ support/{faq,contact}/  checkout/  policies/[slug]/
│  └─ globals.css           brand tokens + shadcn theme
├─ components/
│  ├─ ui/                   shadcn primitives
│  ├─ layout/               navbar · footer · floating-actions
│  ├─ home/                 one file per homepage section
│  ├─ product/              card · detail · tabs · illustration · catalogue-browser
│  ├─ cart/                 cart-sheet · cart-hydrator · checkout-preview
│  ├─ forms/                export · contact · join-us
│  └─ shared/               logo · reveal · section-heading · social-icons
├─ lib/      constants.ts (site config, nav, FAQs, ethos) · products.ts · utils.ts
├─ store/    cart-store.ts
└─ types/    index.ts
```

### Design tokens

The palette is taken straight from the logo — **white ground, charcoal ink,
orange accent**. Scales live in `globals.css` under `@theme inline`:

- `brand-50…950` — the logo orange; `brand-600` is `#F36C21` exactly
- `ink-50…950` — neutral charcoal for dark surfaces (footer, dark panels).
  Use these, *not* `brand-800`, for large dark areas — a dark orange reads as mud.
- `cta-300…600` — CTA orange with `cta-foreground` (white) for text on it
- `leaf-400…600` — warm amber for "savings"/positive accents

Use them as ordinary utilities: `bg-brand-600`, `text-cta-300`, `bg-ink-900`.
Two helpers: `.metro-wash` (warm near-white radial section background) and
`.metro-tile` (product-image tile gradient).

The only non-palette colour in the app is WhatsApp green (`#25D366`) on the
WhatsApp buttons — that's WhatsApp's own brand mark and should stay.

---

## Phase 2 setup (database + API)

```bash
cp .env.example .env          # then edit DATABASE_URL if not using Docker

# Local Postgres (throwaway container on port 55432)
docker run -d --name metro-pg \
  -e POSTGRES_USER=metro -e POSTGRES_PASSWORD=metro -e POSTGRES_DB=metro \
  -p 55432:5432 postgres:16-alpine

npm run db:migrate            # apply migrations
npm run db:seed               # load the 14 products
npm run dev
```

After the first run, `npm run db:up` restarts the existing container.
`npm run db:studio` opens Prisma Studio to browse orders and enquiries.

### API routes

| Route | Purpose |
| --- | --- |
| `GET /api/products` | Catalogue. Optional `?category=` `?featured=true` `?q=` |
| `POST /api/checkout` | Validates, re-prices from the DB, creates the order, hands off to the payment provider |
| `POST /api/export` | Export enquiry → `Query` + email |
| `POST /api/contact` | Support enquiry → `Query` + email |
| `POST /api/webhooks/payment` | Gateway callback; marks orders PAID/FAILED |

### Things that are load-bearing

- **Prices are never taken from the request.** `/api/checkout` receives only
  `{slug, size, colorName, quantity}` and looks every price up in Postgres. A
  payload claiming a Rs. 32,000 fan costs Rs. 1 is still charged Rs. 32,000.
  Don't "optimise" this by trusting a client-sent price.
- **Money is `Int` (whole PKR) everywhere.** Never introduce a Float for a price.
- **Email is best-effort.** Every send is wrapped in `allSettled`; a Resend
  outage or missing key can't fail a committed order. Without `RESEND_API_KEY`,
  sends are skipped and logged.
- **Order-line rows are snapshots** (name, price, colour at time of purchase),
  and `OrderItem.productId` is nullable — deleting a product never rewrites
  order history.
- **The payment webhook fails closed.** `safepay.ts` is a documented stub that
  *throws* rather than returning "paid": it can't verify signatures yet, and
  guessing that crypto would mean accepting forged payment callbacks. COD is
  fully implemented and needs no gateway.

### To enable Safepay

`src/lib/payments/safepay.ts` carries the confirmed parts of their API (SDK
name, `session.setup` shape, sandbox/live hosts). Two things must come from your
merchant dashboard before it can go live: the hosted-checkout redirect URL
format, and the webhook signature header + algorithm. Fill those in, set the
`SAFEPAY_*` env vars and `PAYMENT_PROVIDER="safepay"`, and the storefront will
start offering card/EasyPaisa/JazzCash automatically — `availablePaymentMethods()`
drives the checkout UI from config.

## Older notes for Phase 2

Things already shaped so the backend drops in with minimal churn:

1. **Product accessors are async.** `getAllProducts`, `getProductBySlug`,
   `getFeaturedProducts`, `getRelatedProducts` in `src/lib/products.ts` are
   already `async` and awaited at every call site — replace the bodies with
   Prisma queries and nothing in the UI changes.
2. **Types mirror the intended schema.** `src/types/index.ts` (`Product`,
   `ProductColor`, `SpecRow`, `CartItem`) maps onto the planned Prisma models.
3. **Zod schemas are exported for reuse** by the future route handlers:
   `exportQuerySchema`, `contactSchema`, `applicationSchema`.
4. **Form submits are stubbed in one place each** — a `setTimeout` marked with a
   comment naming the endpoint that replaces it (`/api/export`, `/api/contact`,
   `/api/careers`).
5. **Cart state is final.** `CartItem` carries everything an order line needs
   (product, size, colour, unit price, quantity); `selectSubtotal` gives the
   PKR total. `/checkout` already reads it.

Remaining Phase 2 work: Prisma schema + migrations, `GET /api/products`,
`POST /api/checkout` (Safepay/PayFast session), `POST /api/webhooks/payment`,
`POST /api/export`, the multi-step shipping form, COD order creation, and Resend
+ React Email templates.

### Two deliberate deviations from the brief

- **`/product/[slug]` instead of `/product/[id]`** — products are addressed by
  slug (`/product/metro-astro-inverter`), which is better for SEO and matches
  the reference site. `generateStaticParams` prerenders all 14.
- **shadcn pinned to the v2 CLI (`new-york`, Radix).** The current shadcn CLI
  (v4) has moved to Base UI, where `asChild` is replaced by `render` and the
  Accordion/Select APIs differ. The Radix line matches the brief and the wider
  ecosystem, so components were generated with `shadcn@2.10.0`. Add more with:

  ```bash
  npx shadcn@2.10.0 add <component>
  ```

  Newly added files import `cn` from `"cn"`; repoint them to `"@/lib/utils"`.

### Performance constraints (please don't undo these)

The page is animation-heavy, so a few rules keep it at 60fps:

- **No SVG `filter` / `feDropShadow` in `fan-illustration.tsx`.** A filter makes
  the browser rasterize the subtree through a Gaussian blur; with a rotating
  group inside, that ran on the main thread *every frame*. Same reason there is
  no CSS `drop-shadow-*` on any element wrapping a spinning fan.
- **Blade rotation is the `.fan-spin` CSS class, not SMIL `<animateTransform>`.**
  CSS transforms composite on the GPU; SMIL drives the main thread.
- **`backdrop-blur` is avoided over moving content** (hero arrows, tech-showcase
  badge) and kept to `-sm` on the sticky navbar, which drops it entirely once
  scrolled. Blur cost scales with radius × area, and a sticky element re-blurs
  on every scroll frame.
- **`<Section>` applies `.defer-offscreen`** (`content-visibility: auto`), so the
  browser skips offscreen layout/paint and pauses animations inside. Pass
  `eager` for above-the-fold sections.
- **`Reveal` / `RevealGroup` / `RevealItem` are CSS + one shared
  IntersectionObserver**, not Framer Motion — that kept ~40 animation runtimes
  off each page and cut ~40 kB from six routes. Framer Motion is still used for
  the hero carousel, cart drawer, product gallery and navbar badge.
- Scroll listeners are rAF-throttled; `ProductCard` is `React.memo`'d because the
  catalogue re-renders it on every keystroke.

### Brand assets and contact data

- **Logo** — `/public/logo.svg`, rendered through `src/components/shared/logo.tsx`.
  It is served `unoptimized` because Next's image optimizer rejects SVG unless
  `dangerouslyAllowSVG` is set globally, and vector art gains nothing from
  re-encoding. `tone="light"` (footer) places it on a white plate, since the
  artwork is black with orange (`#F36C21`) accents and would otherwise vanish
  against the dark teal.
- **Contact details** are centralised in the `SITE` object in
  `src/lib/constants.ts` — address, `phone`/`phoneDigits`, `landlines[]`,
  `contactPerson`, `email`, and the Google Maps embed/link. Change them once
  there and every page, the WhatsApp link and the FAQ copy follow.

### Still placeholder

Product names, prices, specs, certifications, the social links in `SITE.social`
and the marketing copy are plausible stand-ins modelled on the reference site —
replace with real Metro Electric Co. data before launch. The policy pages are
starting points, not legal advice.
