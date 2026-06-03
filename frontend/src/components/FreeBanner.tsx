import { Sparkles } from "lucide-react";
import { useParallax } from "../useParallax";
import { useReveal } from "../useReveal";

export function FreeBanner() {
  const { ref, visible } = useReveal<HTMLElement>();
  const { ref: stripRef, offset } = useParallax<HTMLDivElement>(0.08, 40);

  return (
    <section ref={ref} className={`cta-wrap section-reveal${visible ? " is-visible" : ""}`}>
      <div className="promo-strip" ref={stripRef} style={{ transform: `translateY(${offset}px)` }}>
        <Sparkles size={28} />
        <div>
          <h3>100% Free. No premium tiers. No ads.</h3>
          <p>Because you're already paying enough for tuition.</p>
        </div>
      </div>
    </section>
  );
}
