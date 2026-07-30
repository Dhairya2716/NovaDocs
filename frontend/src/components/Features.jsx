import { motion } from "framer-motion";
import {
  MessagesSquare,
  ScanSearch,
  BookMarked,
  ListChecks,
  History,
  ShieldCheck,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading.jsx";

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Chat across documents",
    description:
      "Ask one question across ten PDFs at once. Marginalia reasons across all of them and tells you which document each part of the answer came from.",
    tone: "signal",
  },
  {
    icon: BookMarked,
    title: "Citations on every claim",
    description:
      "No answer without a source. Every sentence links back to the exact page, so you can verify in one click instead of re-reading the whole file.",
    tone: "citation",
  },
  {
    icon: ScanSearch,
    title: "Semantic search",
    description:
      "Search for a concept, not a keyword. Find the clause about early termination even if it never uses the word \"termination.\"",
    tone: "vector",
  },
  {
    icon: ListChecks,
    title: "Instant summaries & quizzes",
    description:
      "Get a one-page brief the moment a file finishes processing, or turn a chapter into a 10-question quiz to check what you actually retained.",
    tone: "signal",
  },
  {
    icon: History,
    title: "Full conversation history",
    description:
      "Every thread is saved against its source document, so you can pick a conversation back up weeks later with full context intact.",
    tone: "vector",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description:
      "Documents are encrypted at rest, processed in isolated workspaces, and never used to train models. Delete any file — and its vectors — in one click.",
    tone: "citation",
  },
];

const TONE_CLASSES = {
  signal: "bg-signal-500/10 text-signal-400",
  citation: "bg-citation-500/10 text-citation-400",
  vector: "bg-vector-500/10 text-vector-400",
};

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything you need to actually trust an AI answer"
          description="Speed is easy. The hard part is proof. Every feature below exists to make the answer verifiable, not just fast."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.035]"
              >
                <span
                  className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                    TONE_CLASSES[feature.tone]
                  }`}
                >
                  <Icon size={19} />
                </span>
                <h3 className="mb-2 text-[15px] font-semibold text-mist-100">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-mist-500">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
