import Nav from "../components/Nav";
import Hero from "../components/Hero";
import TrustedBy from "../components/TrustedBy";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import RagPipeline from "../components/RagPipeline";
import LiveDemo from "../components/LiveDemo";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "../lib/useLenis.js";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  useLenis();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        gsap.to(el, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
    });
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Nav />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <RagPipeline />
        <LiveDemo />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
