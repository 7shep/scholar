import { AppScreenshots } from "../components/AppScreenshots";
import { FeatureHighlights } from "../components/FeatureHighlights";
import { FinalCTA } from "../components/FinalCTA";
import { Footer } from "../components/Footer";
import { FreeBanner } from "../components/FreeBanner";
import { Hero } from "../components/Hero";
import { Nav } from "../components/Nav";
import { useScreenInit } from "../useScreenInit";

export function Landing() {
  const { parallax } = useScreenInit();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#CCFF00] selection:text-slate-900 page">
      <Nav />
      <main>
        <Hero heroWindowY={parallax.heroWindowY} heroAuraY={parallax.heroAuraY} />
        <AppScreenshots
          dotsY={parallax.dotsY}
          backdropY={parallax.screenshotsBackdropY}
          frontY={parallax.screenshotsFrontY}
        />
        <FeatureHighlights />
        <FreeBanner />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
