import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, HelpCircle, MessagesSquare, FileText } from "lucide-react";
import SectionHeading from "./ui/SectionHeading.jsx";

const TABS = [
  { key: "chat", label: "Chat", icon: MessagesSquare },
  { key: "search", label: "Semantic search", icon: Search },
  { key: "quiz", label: "Quiz generation", icon: HelpCircle },
];

export default function LiveDemo() {
  const [tab, setTab] = useState("chat");

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          eyebrow="See it in action"
          title="One document, three ways to understand it"
          description="Switch between modes to see how Marginalia adapts to how you actually work."
        />

        <div className="mt-14 flex justify-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] p-1.5 mx-auto w-fit">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-ink-950" : "text-mist-500 hover:text-mist-100"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-signal-500"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-white/[0.06] bg-white/[0.015] p-3 sm:p-6">
          <AnimatePresence mode="wait">
            {tab === "chat" && <ChatPanel key="chat" />}
            {tab === "search" && <SearchPanel key="search" />}
            {tab === "quiz" && <QuizPanel key="quiz" />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function PanelWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="min-h-[340px] p-2 sm:p-4"
    >
      {children}
    </motion.div>
  );
}

function ChatPanel() {
  return (
    <PanelWrapper>
      <div className="mb-4 flex items-center gap-2 text-xs text-mist-700">
        <FileText size={13} /> Clinical-Trial-Results.pdf · 86 pages
      </div>
      <div className="space-y-3">
        <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-signal-500/15 px-4 py-2.5 text-sm text-mist-100">
          Did the trial meet its primary endpoint?
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-mist-300">
          Yes. The trial met its primary endpoint, showing a{" "}
          <span className="font-medium text-mist-100">
            34% reduction in relapse rate
          </span>
          <sup className="citation-chip ml-1">p. 22</sup> versus placebo over
          52 weeks, with a p-value of 0.003
          <sup className="citation-chip ml-1">p. 23</sup>. Secondary
          endpoints on quality-of-life scores were directionally positive but
          did not reach statistical significance
          <sup className="citation-chip ml-1">p. 27</sup>.
        </div>
        <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-signal-500/15 px-4 py-2.5 text-sm text-mist-100">
          What was the most common adverse event?
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-mist-300">
          Mild headache, reported by{" "}
          <span className="font-medium text-mist-100">18% of participants</span>
          <sup className="citation-chip ml-1">p. 31</sup> in the treatment
          arm versus 6% on placebo.
        </div>
      </div>
    </PanelWrapper>
  );
}

function SearchPanel() {
  const results = [
    {
      snippet:
        "...termination may occur without cause upon 60 days' written notice, provided all outstanding fees are settled prior to...",
      page: 9,
      score: 0.94,
    },
    {
      snippet:
        "...either party may unwind the agreement early if the other undergoes a change of control affecting more than 50%...",
      page: 14,
      score: 0.88,
    },
    {
      snippet:
        "...a cure period of 30 days applies before either party may treat the agreement as terminated for breach...",
      page: 16,
      score: 0.81,
    },
  ];
  return (
    <PanelWrapper>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
        <Search size={14} className="text-mist-500" />
        <span className="text-sm text-mist-100">
          early contract termination clauses
        </span>
      </div>
      <div className="space-y-2.5">
        {results.map((r, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3"
          >
            <p className="text-sm leading-relaxed text-mist-500">
              <span className="italic">"{r.snippet}"</span>
            </p>
            <div className="flex flex-shrink-0 flex-col items-end gap-1">
              <span className="citation-chip">p. {r.page}</span>
              <span className="font-mono text-[10px] text-mist-700">
                {Math.round(r.score * 100)}% match
              </span>
            </div>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}

function QuizPanel() {
  const questions = [
    {
      q: "What is the notice period for termination without cause?",
      options: ["30 days", "60 days", "90 days", "Immediate"],
      answer: 1,
    },
    {
      q: "What triggers early termination under change of control?",
      options: [
        "Any ownership change",
        ">50% change of control",
        "New CEO appointment",
        "Merger announcement only",
      ],
      answer: 1,
    },
  ];
  return (
    <PanelWrapper>
      <div className="mb-4 flex items-center gap-2 text-xs text-mist-700">
        <HelpCircle size={13} /> Auto-generated from Series-B-Term-Sheet.pdf
      </div>
      <div className="space-y-5">
        {questions.map((item, i) => (
          <div key={i}>
            <p className="mb-3 text-sm font-medium text-mist-100">
              {i + 1}. {item.q}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {item.options.map((opt, oi) => (
                <div
                  key={opt}
                  className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                    oi === item.answer
                      ? "border-vector-500/40 bg-vector-500/10 text-vector-400"
                      : "border-white/[0.06] bg-white/[0.02] text-mist-500"
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}
