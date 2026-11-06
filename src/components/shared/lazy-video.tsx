"use client";

import * as React from "react";

/**
 * A looping product video that downloads nothing until it scrolls into view.
 *
 * `preload="none"` alone is not enough: the moment a browser honours
 * `autoPlay` it starts fetching, wherever the element sits on the page. This
 * withholds `src` entirely until an IntersectionObserver says the element is
 * near the viewport, so a video far down the homepage costs zero bytes to
 * visitors who never scroll to it - which is the difference between a video
 * that is free and one that shows up in Largest Contentful Paint.
 *
 * The poster renders immediately either way, so the frame is never empty.
 */
export function LazyVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [load, setLoad] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || load) return;

    // No observer (old browser, or a reduced-capability environment): fall back
    // to loading it, so the video is never permanently withheld.
    if (typeof IntersectionObserver === "undefined") {
      setLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          observer.disconnect();
        }
      },
      // Starts fetching just before it is reached, so it is playing by the
      // time it is actually on screen.
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [load]);

  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={className}
    />
  );
}
