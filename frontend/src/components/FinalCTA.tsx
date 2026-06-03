import { useParallax } from "../useParallax";
import { useReveal } from "../useReveal";
import { DownloadButton } from "./shared";

export function FinalCTA() {
  const { ref, visible } = useReveal<HTMLElement>();
  const { ref: cardRef, offset } = useParallax<HTMLDivElement>(0.06, 36);

  return (
    <section ref={ref} className={`section-reveal${visible ? " is-visible" : ""}`}>
      <div className="container">
        <div className="cta-card" ref={cardRef} style={{ transform: `translateY(${offset}px)` }}>
          <h2>Ready to ace this semester?</h2>
          <p>
            Join thousands of students who have already upgraded their study workflow. Download Scholar today for
            free.
          </p>
          <div className="download-row">
            <DownloadButton platform="macOS" />
            <DownloadButton platform="Windows" />
          </div>
        </div>
      </div>
    </section>
  );
}
