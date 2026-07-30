import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  UploadCloud,
  ScanText,
  Layers,
  Sparkles,
  Database,
  Radar,
  BrainCircuit,
  MessageSquareText,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading.jsx";

const STAGES = [
  {
    key: "upload",
    icon: UploadCloud,
    title: "Upload PDF",
    blurb: "The raw file arrives",
    detail:
      "The document lands in an isolated processing workspace. Nothing else happens to it until you ask a question — no background training, no sharing across accounts.",
  },
  {
    key: "parse",
    icon: ScanText,
    title: "Parse document",
    blurb: "Text, tables & layout extracted",
    detail:
      "Marginalia reads the PDF's structure — paragraphs, tables, headers and footnotes — and reconstructs clean, ordered text even from scanned or multi-column pages.",
  },
  {
    key: "chunk",
    icon: Layers,
    title: "Chunk text",
    blurb: "Split into semantic passages",
    detail:
      "The document is divided into overlapping passages sized for meaning, not just character count — so a clause never gets cut off mid-sentence.",
  },
  {
    key: "embed",
    icon: Sparkles,
    title: "Generate embeddings",
    blurb: "Each chunk becomes a vector",
    detail:
      "Every chunk is converted into a high-dimensional vector that encodes its meaning, so passages about the same idea land near each other in vector space.",
  },
  {
    key: "store",
    icon: Database,
    title: "Store in vector database",
    blurb: "Indexed for instant recall",
    detail:
      "Vectors are indexed alongside the exact page number and bounding box they came from — the foundation that makes citations possible later.",
  },
  {
    key: "retrieve",
    icon: Radar,
    title: "Semantic retrieval",
    blurb: "Find the closest passages",
    detail:
      "Your question is embedded the same way, then compared against every chunk. The nearest matches — by meaning, not keyword — are pulled for the model.",
  },
  {
    key: "llm",
    icon: BrainCircuit,
    title: "Large language model",
    blurb: "Reasoning over retrieved context",
    detail:
      "The model reads only the retrieved passages plus your question — never the whole document — which keeps answers grounded and fast, even on huge files.",
  },
  {
    key: "answer",
    icon: MessageSquareText,
    title: "AI response with citations",
    blurb: "Answer + page references",
    detail:
      "The final answer streams back with each claim linked to the page it came from, so you can verify anything in a single click.",
  },
];

const STAGE_DURATION = 2400;

export default function RagPipeline() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % STAGES.length);
    }, STAGE_DURATION);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  function jumpTo(i) {
    setActive(i);
    setPlaying(false);
  }

  function restart() {
    setActive(0);
    setPlaying(true);
  }

  const stage = STAGES[active];

  return (
    <section id="pipeline" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Under the hood"
          title="Watch a real question move through the pipeline"
          description="Retrieval-augmented generation, made visible. Step through each stage, or let it play."
        />

        <div className="mt-16 rounded-3xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-8">
          {/* Controls */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-mist-100 transition-colors hover:bg-white/[0.09]"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>
              <button
                onClick={restart}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-mist-100 transition-colors hover:bg-white/[0.09]"
                aria-label="Restart"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            <span className="font-mono text-[11px] text-mist-700">
              stage {String(active + 1).padStart(2, "0")} / {STAGES.length}
            </span>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              const isDone = i < active;
              return (
                <button
                  key={s.key}
                  onClick={() => jumpTo(i)}
                  className="group relative flex flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-white/[0.04]"
                  title={s.title}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "border-signal-500/50 bg-signal-500/15 text-signal-400 shadow-glow"
                        : isDone
                        ? "border-vector-500/30 bg-vector-500/10 text-vector-400"
                        : "border-white/[0.06] bg-white/[0.02] text-mist-700"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span
                    className={`hidden text-[10px] leading-tight sm:block ${
                      isActive ? "text-mist-100" : "text-mist-700"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress bar under stepper */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-signal-500 via-vector-500 to-citation-500"
              animate={{ width: `${((active + 1) / STAGES.length) * 100}%` }}
              transition={{ ease: "easeOut", duration: 0.4 }}
            />
          </div>

          {/* Detail + visualization panel */}
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.key + "-text"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <p className="eyebrow mb-3">{stage.blurb}</p>
                <h3 className="mb-3 font-display text-2xl font-medium text-mist-100">
                  {stage.title}
                </h3>
                <p className="text-sm leading-relaxed text-mist-500">
                  {stage.detail}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-950/60">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage.key + "-viz"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex h-full w-full items-center justify-center p-6"
                >
                  <StageVisual stageKey={stage.key} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StageVisual({ stageKey }) {
  switch (stageKey) {
    case "upload":
      return <UploadVisual />;
    case "parse":
      return <ParseVisual />;
    case "chunk":
      return <ChunkVisual />;
    case "embed":
      return <EmbedVisual />;
    case "store":
      return <VectorDbVisual />;
    case "retrieve":
      return <RetrieveVisual />;
    case "llm":
      return <LlmVisual />;
    case "answer":
      return <AnswerVisual />;
    default:
      return null;
  }
}

function UploadVisual() {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="glass flex h-40 w-32 flex-col items-center justify-center gap-2 rounded-xl"
    >
      <ScanText size={28} className="text-signal-400" />
      <span className="font-mono text-[10px] text-mist-500">report.pdf</span>
    </motion.div>
  );
}

function ParseVisual() {
  const lines = [92, 70, 84, 55, 76, 40];
  return (
    <div className="glass w-56 rounded-xl p-5">
      {lines.map((w, i) => (
        <motion.div
          key={i}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: `${w}%`, opacity: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className={`mb-2.5 h-2 rounded-full last:mb-0 ${
            i % 3 === 0 ? "bg-signal-500/50" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function ChunkVisual() {
  const chunks = ["A", "B", "C", "D", "E", "F"];
  const colors = ["signal", "vector", "citation"];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {chunks.map((c, i) => (
        <motion.div
          key={c}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          className={`flex h-14 w-16 items-center justify-center rounded-lg border font-mono text-xs ${
            colors[i % 3] === "signal"
              ? "border-signal-500/30 bg-signal-500/10 text-signal-400"
              : colors[i % 3] === "vector"
              ? "border-vector-500/30 bg-vector-500/10 text-vector-400"
              : "border-citation-500/30 bg-citation-500/10 text-citation-400"
          }`}
        >
          §{c}
        </motion.div>
      ))}
    </div>
  );
}

function EmbedVisual() {
  const dots = Array.from({ length: 24 });
  return (
    <div className="relative h-48 w-56">
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const radius = 40 + (i % 3) * 20;
        const x = 50 + Math.cos(angle) * (radius / 2.2);
        const y = 50 + Math.sin(angle) * (radius / 2.6);
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, left: "50%", top: "50%" }}
            animate={{ opacity: 0.9, left: `${x}%`, top: `${y}%` }}
            transition={{ delay: i * 0.02, duration: 0.6, ease: "easeOut" }}
            className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-vector-400"
            style={{ boxShadow: "0 0 8px rgba(88,217,196,0.7)" }}
          />
        );
      })}
      <Sparkles
        size={20}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-mist-500"
      />
    </div>
  );
}

function VectorDbVisual() {
  const points = Array.from({ length: 34 }).map((_, i) => ({
    x: 10 + ((i * 37) % 90),
    y: 10 + ((i * 53) % 80),
    tone: i % 4 === 0,
  }));
  return (
    <div className="relative h-48 w-full max-w-xs">
      <div className="absolute inset-0 rounded-xl border border-white/[0.06]" />
      {points.map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: p.tone ? 1 : 0.45, scale: 1 }}
          transition={{ delay: i * 0.015 }}
          className={`absolute h-1.5 w-1.5 rounded-full ${
            p.tone ? "bg-signal-400" : "bg-mist-500/60"
          }`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        />
      ))}
      <Database
        size={18}
        className="absolute bottom-2 right-2 text-mist-700"
      />
    </div>
  );
}

function RetrieveVisual() {
  const neighbors = [
    { x: 30, y: 25 },
    { x: 68, y: 35 },
    { x: 45, y: 68 },
  ];
  return (
    <div className="relative h-48 w-full max-w-xs">
      <div className="absolute inset-0 rounded-xl border border-white/[0.06]" />
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute left-1/2 top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-citation-500/20 ring-2 ring-citation-400"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-citation-400" />
      </motion.span>
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {neighbors.map((n, i) => (
          <motion.line
            key={i}
            x1="50%"
            y1="50%"
            x2={`${n.x}%`}
            y2={`${n.y}%`}
            stroke="#F5B94D"
            strokeWidth="1"
            strokeDasharray="3 3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.3 + i * 0.15 }}
          />
        ))}
      </svg>
      {neighbors.map((n, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.15 }}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-citation-400"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        />
      ))}
    </div>
  );
}

function LlmVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex h-32 w-32 items-center justify-center"
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-signal-500/10"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-signal-500/40 bg-ink-900 text-signal-400 shadow-glow">
        <BrainCircuit size={30} />
      </span>
    </motion.div>
  );
}

function AnswerVisual() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left">
      <p className="text-xs leading-relaxed text-mist-300">
        The liability cap is limited to fees paid in the prior 12 months
        <sup className="citation-chip ml-1">p. 14</sup>, excluding claims
        arising from confidentiality breaches
        <sup className="citation-chip ml-1">p. 15</sup>.
      </p>
    </div>
  );
}
