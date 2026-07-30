import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MagneticButton from "./ui/MagneticButton.jsx";

export default function CTA() {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-signal-500/[0.12] via-ink-850 to-vector-500/[0.08] px-8 py-16 text-center sm:px-16"
      >
        <div
          data-parallax
          className="absolute inset-0 bg-aurora opacity-60"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="font-display text-3xl font-medium leading-tight text-mist-100 sm:text-4xl">
            Stop skimming. Start asking.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-mist-500">
            Upload your first PDF and get a cited answer in under a minute —
            no credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticButton as="a" href="#upload" className="btn-primary">
              Upload a PDF, free
              <ArrowRight size={16} />
            </MagneticButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
