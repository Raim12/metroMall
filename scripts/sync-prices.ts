/**
 * Nightly price sync: re-reads every brand's website and brings our prices in
 * step with theirs.
 *
 *   npm run sync:prices              # apply changes
 *   npm run sync:prices -- --dry-run # report only, change nothing
 *   npm run sync:prices -- royal gfc # only these brands
 *
 * Rules, per product (matched on Product.sourceUrl):
 *   - price === sourcePrice (owner hasn't customised it) -> price follows the brand
 *   - owner set their own price                          -> left alone; sourcePrice still updated
 *   - change of more than MAX_JUMP either way            -> held for review, nothing written
 *   - hidden only because it had no price, now priced    -> priced and made live
 *
 * Products the brand no longer lists are reported, never deleted. A summary is
 * written to logs/price-sync-<date>.json; the exit code is non-zero only when
 * the run itself fails, so a scheduler can alert on it.
 *
 * Wester and Jackpot publish no prices, so they are skipped.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

/** Changes bigger than this fraction are almost always a scraping glitch. */
const MAX_JUMP = 0.5;

interface SitePrice {
  url: string;
  price: number | null;
  compareAt: number | null;
}

// ------------------------------------------------------------------ fetching

async function get(url: string, headers: Record<string, string> = {}): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": UA, ...headers },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Compromised sites append injected <script> after JSON; drop it.
      return await res.text();
    } catch (error) {
      if (attempt >= 3) throw new Error(`${url}: ${(error as Error).message}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

const json = async <T>(url: string): Promise<T> =>
  JSON.parse((await get(url, { accept: "application/json" })).split("<script")[0]) as T;

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        try {
          out[i] = await fn(items[i]);
        } catch (error) {
          console.warn(`  ! ${(error as Error).message}`);
        }
      }
    }),
  );
  return out.filter(Boolean);
}

const round = (n: number | null) => (n && n > 0 ? Math.round(n) : null);

/** Same rule as the import: lowest variant price, highest compare-at above it. */
function pick(prices: number[], compares: number[]) {
  const p = prices.filter((n) => n > 0);
  const price = p.length ? Math.min(...p) : null;
  const c = compares.filter((n) => n > 0);
  const compareAt = c.length ? Math.max(...c) : null;
  return { price: round(price), compareAt: compareAt && price && compareAt > price ? round(compareAt) : null };
}

async function shopify(base: string): Promise<SitePrice[]> {
  type Feed = { products: { handle: string; variants: { price: string; compare_at_price: string | null }[] }[] };
  const out: SitePrice[] = [];
  for (let page = 1; page < 20; page++) {
    const { products } = await json<Feed>(`${base}/products.json?limit=250&page=${page}`);
    if (!products?.length) break;
    for (const p of products) {
      out.push({
        url: `${base}/products/${p.handle}`,
        ...pick(
          p.variants.map((v) => Number(v.price)),
          p.variants.map((v) => Number(v.compare_at_price)),
        ),
      });
    }
  }
  return out;
}

async function woo(base: string): Promise<SitePrice[]> {
  type Item = { permalink: string; prices?: { price?: string; regular_price?: string; currency_minor_unit?: number } };
  const out: SitePrice[] = [];
  for (let page = 1; page < 20; page++) {
    const items = await json<Item[]>(`${base}/wp-json/wc/store/v1/products?per_page=100&page=${page}`);
    if (!Array.isArray(items) || !items.length) break;
    for (const p of items) {
      const unit = 10 ** (p.prices?.currency_minor_unit ?? 0);
      const price = p.prices?.price ? Number(p.prices.price) / unit : 0;
      const regular = p.prices?.regular_price ? Number(p.prices.regular_price) / unit : 0;
      out.push({ url: p.permalink, ...pick([price], [regular]) });
    }
  }
  return out;
}

/** Orient & Pak Fans have no feed: read the price off each known product page. */
async function pages(urls: string[], extract: (html: string) => number | null): Promise<SitePrice[]> {
  return pool(urls, 4, async (url) => ({ url, price: round(extract(await get(url))), compareAt: null }));
}

const orientPrice = (html: string) => {
  const m = /pd-current-price">\s*PKR\s*([\d,.]+)/.exec(html);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};

const pakFansPrice = (html: string) => {
  const m = /itemprop="price" content="([\d.]+)"|price" content="([\d.]+)"/.exec(html);
  return m ? Number(m[1] ?? m[2]) : null;
};

/** brand slug -> how to read its prices. `urls` are our stored sourceUrls for that brand. */
const SOURCES: Record<string, (urls: string[]) => Promise<SitePrice[]>> = {
  royal: () => shopify("https://royalfans.com"),
  "super-asia": () => shopify("https://superasiastore.com"),
  tamoor: () => shopify("https://www.tamoorfans.com"),
  sonex: () => shopify("https://www.sonexfan.com"),
  gfc: () => shopify("https://gfcfans.com"),
  voldam: () => shopify("https://voldam.com.pk"),
  nasgas: () => shopify("https://nasgas.com"),
  hanco: () => shopify("https://www.hanco.pk"),
  sk: () => woo("https://www.skfans.com.pk"),
  orient: (urls) => pages(urls, orientPrice),
  "pak-fans": (urls) => pages(urls, pakFansPrice),
};

// ------------------------------------------------------------------ syncing

const normalise = (url: string) => url.replace(/\/+$/, "").replace(/^https?:\/\/(www\.)?/, "").toLowerCase();

interface Change {
  brand: string;
  slug: string;
  name: string;
  from: number | null;
  to: number | null;
  note: string;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const only = args.filter((a) => !a.startsWith("--"));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const started = new Date();
  const report = {
    startedAt: started.toISOString(),
    dryRun,
    updated: [] as Change[],
    ownerPriceKept: [] as Change[],
    heldForReview: [] as Change[],
    madeLive: [] as Change[],
    notOnBrandSite: [] as { brand: string; slug: string; name: string }[],
    failedBrands: [] as { brand: string; error: string }[],
    checked: 0,
  };

  for (const [brand, fetchPrices] of Object.entries(SOURCES)) {
    if (only.length && !only.includes(brand)) continue;

    const products = await prisma.product.findMany({
      where: { brand, sourceUrl: { not: null } },
      select: { id: true, slug: true, name: true, price: true, compareAtPrice: true, sourcePrice: true, active: true, sourceUrl: true },
    });
    if (!products.length) continue;

    let site: SitePrice[];
    try {
      site = await fetchPrices(products.map((p) => p.sourceUrl!));
    } catch (error) {
      report.failedBrands.push({ brand, error: (error as Error).message });
      console.error(`✗ ${brand}: ${(error as Error).message}`);
      continue;
    }
    const byUrl = new Map(site.map((s) => [normalise(s.url), s]));
    let changed = 0;

    for (const p of products) {
      const s = byUrl.get(normalise(p.sourceUrl!));
      if (!s) {
        report.notOnBrandSite.push({ brand, slug: p.slug, name: p.name });
        continue;
      }
      report.checked++;
      if (!s.price) continue; // brand stopped showing a price; keep ours

      const base = { brand, slug: p.slug, name: p.name, from: p.price, to: s.price };
      const ownerCustomised = p.sourcePrice !== null && p.price !== p.sourcePrice && p.price > 0;
      const reference = p.sourcePrice ?? p.price;
      const jump = reference > 0 ? Math.abs(s.price - reference) / reference : 0;

      if (jump > MAX_JUMP) {
        report.heldForReview.push({ ...base, from: reference, note: `${Math.round(jump * 100)}% change` });
        continue;
      }

      const data: Record<string, unknown> = { sourcePrice: s.price, sourceCheckedAt: started };
      if (ownerCustomised) {
        if (s.price !== p.sourcePrice) {
          report.ownerPriceKept.push({ ...base, from: p.sourcePrice, note: `your price Rs ${p.price} kept` });
        }
      } else if (p.price === 0) {
        Object.assign(data, { price: s.price, compareAtPrice: s.compareAt, active: true });
        report.madeLive.push({ ...base, note: "now priced on brand site" });
      } else if (s.price !== p.price || s.compareAt !== p.compareAtPrice) {
        Object.assign(data, { price: s.price, compareAtPrice: s.compareAt, badge: s.compareAt ? "Sale" : null });
        if (s.price !== p.price) report.updated.push({ ...base, note: s.price > p.price ? "up" : "down" });
      }

      if (!dryRun) await prisma.product.update({ where: { id: p.id }, data });
      if ("price" in data) changed++;
    }

    console.log(`✓ ${brand}: ${products.length} products, ${site.length} on site, ${changed} price change(s)`);
  }

  const logDir = path.join(__dirname, "..", "logs");
  mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `price-sync-${started.toISOString().slice(0, 10)}.json`);
  writeFileSync(logFile, JSON.stringify({ ...report, finishedAt: new Date().toISOString() }, null, 2));

  const show = (title: string, rows: Change[]) => {
    if (!rows.length) return;
    console.log(`\n${title} (${rows.length}):`);
    for (const r of rows.slice(0, 40))
      console.log(`  ${r.brand.padEnd(10)} ${r.name.slice(0, 50).padEnd(50)} Rs ${r.from ?? "-"} → ${r.to ?? "-"}  ${r.note}`);
    if (rows.length > 40) console.log(`  … ${rows.length - 40} more in the log file`);
  };
  console.log(`\n${dryRun ? "[DRY RUN — nothing saved] " : ""}Checked ${report.checked} products.`);
  show("Price updated", report.updated);
  show("Now live (newly priced)", report.madeLive);
  show("Your own price kept", report.ownerPriceKept);
  show("HELD FOR REVIEW — check the brand site and set manually", report.heldForReview);
  if (report.notOnBrandSite.length) console.log(`\n${report.notOnBrandSite.length} product(s) no longer found on brand sites (left as they are).`);
  if (report.failedBrands.length) console.log(`\nFailed brands: ${report.failedBrands.map((b) => b.brand).join(", ")}`);
  console.log(`\nLog: ${logFile}`);

  await prisma.$disconnect();
  // A brand site being down is reported, not fatal; only total failure exits non-zero.
  if (report.failedBrands.length === Object.keys(SOURCES).length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
