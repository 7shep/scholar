import { useReveal } from "../useReveal";
import { Brand } from "./shared";

export function Footer() {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <footer ref={ref} className={`footer section-reveal${visible ? " is-visible" : ""}`}>
      <div className="container footer__inner">
        <div>
          <a href="#" className="brand-link" aria-label="Scholar home">
            <Brand />
          </a>
          <p>The all-in-one organizer for students.</p>
        </div>
        <nav aria-label="Legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </nav>
      </div>
      <p className="copyright">(c) 2026 Scholar App. All rights reserved.</p>
    </footer>
  );
}
