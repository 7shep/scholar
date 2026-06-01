import { useEffect, useRef, useState } from "react";

type RevealOptions = {
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number;
  /** IntersectionObserver rootMargin — negative bottom margin triggers slightly early. */
  rootMargin?: string;
  /** Reveal only once (default) or re-hide when scrolled out of view. */
  once?: boolean;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveals an element when it scrolls into view. Returns a ref to attach to the
 * element and a `visible` flag to drive the fade-in animation.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.16,
  rootMargin = "0px 0px -12% 0px",
  once = true,
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No scroll choreography for users who opted out of motion.
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}
