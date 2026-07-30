import { motion } from "framer-motion";
import { Upload, MessageCircle, Share2 } from "lucide-react";
import SectionHeading from "./ui/SectionHeading.jsx";

const STEPS = [
  {
    icon: Upload,
    title: "Drop in your documents",
    description:
      "PDFs, scanned contracts, or research bundles — up to 500 pages each. Processing starts the moment the upload finishes.",
  },
  {
    icon: MessageCircle,
    title: "Ask it anything",
    description:
      "Type a question the way you'd ask a colleague. Marginalia retrieves the relevant passages and answers in plain language, cited by page.",
  },
  {
    icon: Share2,
    title: "Share or export the thread",
    description:
      "Turn a conversation into a shareable brief, or export the citations as footnotes into your own report.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Workflow"
          title="From PDF to conversation in under a minute"
        />

        <div className="relative mt-20 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {/* connecting line for desktop */}
          <svg
            className="pointer-events-none absolute left-0 top-8 hidden w-full md:block"
            height="2"
            aria-hidden="true"
          >
            <line
              x1="16%"
              x2="84%"
              y1="1"
              y2="1"
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              strokeDasharray="3 5"
            />
            <defs>
              <linearGradient id="lineGradient" x1="0" x2="1">
                <stop offset="0%" stopColor="#6C8EFF" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#58D9C4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F5B94D" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                className="relative flex flex-col items-start"
              >
                <span className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-ink-850 text-signal-400 shadow-glass">
                  <Icon size={24} />
                </span>
                <h3 className="mb-2 font-display text-xl font-medium text-mist-100">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-mist-500">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
