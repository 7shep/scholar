import { Brand } from "./shared";

export function Nav() {
  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <a href="#" className="brand-link" aria-label="Scholar home">
          <Brand />
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          {/* <a href="#download">Download</a> */}
        </nav>
        {/* <div className="topbar__actions">
          <span className="free-chip">100% Free</span>
          <a className="app-btn" href="#download">
            Get the App
          </a>
        </div> */}
      </div>
    </header>
  );
}
