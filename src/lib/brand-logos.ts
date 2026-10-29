/**
 * Official brand logos, as served from `public/brands/logos/`.
 *
 * Sourced from each brand's own website and normalised to a common 160px
 * height with the surrounding padding trimmed, so a row of them sits on one
 * baseline without per-logo nudging.
 *
 * A brand missing from this map is not an error: the UI falls back to setting
 * its name as a wordmark, which is what `BrandStrip` has always done. Dropping
 * a correctly named file into the folder and adding a line here is all that is
 * needed to promote one to a real logo.
 *
 * These are third-party trademarks, shown to identify the brands this shop is
 * an authorised dealer for.
 */
export const BRAND_LOGOS: Record<string, string> = {
  gfc: "/brands/logos/gfc.webp",
  hanco: "/brands/logos/hanco.webp",
  nasgas: "/brands/logos/nasgas.webp",
  orient: "/brands/logos/orient.webp",
  "pak-fans": "/brands/logos/pak-fans.webp",
  royal: "/brands/logos/royal.webp",
  sk: "/brands/logos/sk.webp",
  "super-asia": "/brands/logos/super-asia.webp",
  tamoor: "/brands/logos/tamoor.webp",
  voldam: "/brands/logos/voldam.webp",
  wester: "/brands/logos/wester.webp",
};

export function brandLogo(slug: string): string | undefined {
  return BRAND_LOGOS[slug];
}
