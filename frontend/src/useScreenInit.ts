import { useEffect, useMemo, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Tracks the global scroll position and derives the parallax offsets used by
 * the hero and showcase sections. Per-section reveals live in `useReveal` and
 * additional depth lives in `useParallax`.
 */
export function useScreenInit() {
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReducedMotion(true);
      return;
    }

    let ticking = false;

    const update = () => {
      setScrollY(window.scrollY || 0);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const parallax = useMemo(() => {
    if (reducedMotion) {
      return {
        heroWindowY: 0,
        heroAuraY: 0,
        screenshotsBackdropY: 0,
        screenshotsFrontY: 0,
        dotsY: 0,
      };
    }

    const heroWindowY = clamp(scrollY * 0.18, 0, 72);
    const heroAuraY = clamp(scrollY * 0.32, 0, 220);
    const screenshotsBackdropY = clamp((scrollY - 350) * 0.14, -25, 70);
    const screenshotsFrontY = clamp((scrollY - 350) * 0.24, -45, 110);
    const dotsY = clamp(scrollY * 0.28, 0, 320);

    return {
      heroWindowY,
      heroAuraY,
      screenshotsBackdropY,
      screenshotsFrontY,
      dotsY,
    };
  }, [scrollY, reducedMotion]);

  return { parallax };
}
