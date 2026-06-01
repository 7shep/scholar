import { BarChart3, CalendarDays, Calculator, RefreshCw, Tag } from "lucide-react";
import { useReveal } from "../useReveal";
import { featureItems } from "./shared";

const iconMap = {
  refresh: RefreshCw,
  tag: Tag,
  bar: BarChart3,
  calc: Calculator,
  calendar: CalendarDays,
} as const;

export function FeatureHighlights() {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className={`features section-reveal${visible ? " is-visible" : ""}`} id="features">
      <div className="container">
        <h2>Built for students, not project managers.</h2>
        <p>Everything you need to survive the semester, without the bloated features you don't.</p>
        <div className="feature-grid">
          {featureItems.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <article
                key={feature.title}
                className={`feature-card feature-card--reveal${feature.wide ? " feature-card--wide" : ""}${
                  visible ? " is-visible" : ""
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <span className="feature-icon">
                  <Icon size={20} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
