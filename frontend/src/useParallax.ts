import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-driven parallax for an arbitrary element. The offset is derived from
 * the element's position relative to the viewport center, so it works anywhere
 * on the page without hard-coded pixel thresholds.
 *
 * @param speed   How strongly the element drifts (0 = none, ~0.05–0.25 is subtle).
 * @param maxShift Clamp on the absolute translateY in px to keep motion tasteful.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.12, maxShift = 90) {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    let ticking = false;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distance = elementCenter - viewportCenter;
      const next = Math.max(-maxShift, Math.min(maxShift, -distance * speed));
      setOffset(next);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, maxShift]);

  return { ref, offset };
}
