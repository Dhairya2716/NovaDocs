import { useEffect, useRef, useState, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  ScanText,
  Layers,
  Sparkles,
  Database,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import MagneticButton from "./ui/MagneticButton.jsx";

// Three.js is only needed for this decorative background layer, so it's
// split into its own chunk and loaded after the critical hero content.
const ParticleField = lazy(() => import("./ParticleField.jsx"));

const DEMO_FILES = [
  { name: "State-of-AI-2026.pdf", size: "4.2 MB", pages: 212 },
  { name: "Series-B-Term-Sheet.pdf", size: "1.1 MB", pages: 34 },
];

const STAGES = [
  { key: "parse", label: "Parsing document", icon: ScanText },
  { key: "chunk", label: "Chunking text", icon: Layers },
  { key: "embed", label: "Generating embeddings", icon: Sparkles },
  { key: "store", label: "Storing in vector DB", icon: Database },
  { key: "ready", label: "AI ready", icon: CheckCircle2 },
];

const ANSWER = [
  { t: "Based on the filing, the company is raising a " },
  { t: "$42M Series B", cite: "p. 3" },
  { t: " at a " },
  { t: "$210M pre-money valuation", cite: "p. 3" },
  { t: ", led by Northbeam Capital with participation from existing investors. The round includes a " },
  { t: "12-month liquidation preference multiple of 1x", cite: "p. 9" },
  { t: ", non-participating." },
];

/**
 * Self-playing (and drop-interactive) demo of the ingestion pipeline:
 * upload -> parse -> chunk -> embed -> vector DB -> AI ready -> streamed
 * answer with page citations. Loops on an interval so the hero never
 * looks "stuck", but responds immediately if a visitor drags in a file.
 */
export default function Hero() {
  const [phase, setPhase] = useState("idle"); // idle | dragging | uploading | pipeline | answering
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(-1);
  const [visibleWords, setVisibleWords] = useState(0);
  const [droppedName, setDroppedName] = useState(null);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const after = (ms, fn) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  const runSequence = useCallback(() => {
    clearTimers();
    setPhase("uploading");
    setProgress(0);
    setStageIndex(-1);
    setVisibleWords(0);

    let p = 0;
    const tick = () => {
      p += Math.random() * 22 + 12;
      if (p >= 100) {
        setProgress(100);
        after(350, () => {
          setPhase("pipeline");
          runStages(0);
        });
        return;
      }
      setProgress(p);
      after(180, tick);
    };
    tick();
  }, []);

  const runStages = useCallback((i) => {
    setStageIndex(i);
    if (i >= STAGES.length - 1) {
      after(700, () => {
        setPhase("answering");
        streamAnswer(0);
      });
      return;
    }
    after(620, () => runStages(i + 1));
  }, []);

  const streamAnswer = useCallback((wordCount) => {
    const totalWords = ANSWER.reduce((acc, seg) => acc + seg.t.split(" ").length, 0);
    if (wordCount >= totalWords) {
      after(4200, () => runSequence());
      return;
    }
    setVisibleWords(wordCount);
    after(55, () => streamAnswer(wordCount + 1));
  }, [runSequence]);

  useEffect(() => {
    after(900, runSequence);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    setDroppedName(file ? file.name : null);
    setPhase("dragging-off");
    runSequence();
  }

  // Build the streamed answer nodes up to visibleWords
  let wordsUsed = 0;
  const answerNodes = [];
  for (const seg of ANSWER) {
    const words = seg.t.split(" ");
    const remaining = visibleWords - wordsUsed;
    if (remaining <= 0) break;
    const shown = words.slice(0, Math.max(0, remaining)).join(" ");
    wordsUsed += words.length;
    if (!shown) continue;
    answerNodes.push(
      seg.cite ? (
        <span key={seg.t} className="font-medium text-mist-100">
          {shown}
          <sup className="citation-chip ml-1 -translate-y-0.5">{seg.cite}</sup>
        </span>
      ) : (
        <span key={seg.t}>{shown}</span>
      )
    );
  }

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28"
    >
      <div className="absolute inset-0 bg-aurora" aria-hidden="true" />
      <Suspense fallback={null}>
        <ParticleField className="opacity-70 mask-fade-b" />
      </Suspense>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        {/* Left: copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-vector-400 animate-pulseDot" />
            <span className="text-xs font-medium text-mist-300">
              Now with multi-document reasoning
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-[2.6rem] font-medium leading-[1.05] tracking-tight text-mist-100 sm:text-6xl lg:text-[3.6rem]"
          >
            Every page,
            <br />
            <span className="italic text-mist-300">annotated by AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-mist-500"
          >
            Marginalia reads your PDFs in seconds and answers questions the
            way a sharp analyst would — with the exact page cited, every
            time. Drop in a contract, a research paper, or a 200-page
            report, and start asking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <MagneticButton as="a" href="#upload" className="btn-primary">
              Upload a PDF, free
              <ArrowRight size={16} />
            </MagneticButton>
            <MagneticButton as="a" href="#pipeline" className="btn-secondary">
              See how it works
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex items-center gap-6 text-xs text-mist-700"
          >
            <span>No credit card required</span>
            <span className="h-1 w-1 rounded-full bg-mist-700" />
            <span>SOC 2 Type II</span>
            <span className="h-1 w-1 rounded-full bg-mist-700" />
            <span>Files deleted on request</span>
          </motion.div>
        </div>

        {/* Right: live demo card */}
        <motion.div
          id="upload"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* floating decorative PDF cards */}
          <div className="pointer-events-none absolute -left-8 -top-8 hidden rotate-[-8deg] animate-float sm:block">
            <MiniPdfCard label="whitepaper.pdf" />
          </div>
          <div
            className="pointer-events-none absolute -right-6 -bottom-10 hidden rotate-[7deg] animate-float sm:block"
            style={{ animationDelay: "1.2s" }}
          >
            <MiniPdfCard label="contract-v3.pdf" tone="vector" />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setPhase("dragging");
            }}
            onDragLeave={() => setPhase((p) => (p === "dragging" ? "idle" : p))}
            onDrop={handleDrop}
            className={`glass relative overflow-hidden rounded-3xl p-6 transition-shadow duration-300 sm:p-8 ${
              phase === "dragging" ? "shadow-glow" : ""
            }`}
          >
            <div
              className={`absolute inset-3 rounded-2xl border-2 border-dashed transition-colors duration-300 ${
                phase === "dragging"
                  ? "border-signal-400/70"
                  : "border-transparent"
              }`}
              aria-hidden="true"
            />

            <div className="relative flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </div>
              <span className="font-mono text-[11px] text-mist-700">
                marginalia.app/chat
              </span>
            </div>

            <div className="relative min-h-[360px] pt-5">
              <AnimatePresence mode="wait">
                {(phase === "idle" || phase === "dragging") && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-[330px] flex-col items-center justify-center gap-3 text-center"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-500/10 text-signal-400">
                      <UploadCloud size={26} />
                    </span>
                    <p className="text-sm font-medium text-mist-100">
                      Drag & drop PDFs, or click to browse
                    </p>
                    <p className="text-xs text-mist-700">
                      Watch it process live — this demo runs automatically
                    </p>
                  </motion.div>
                )}

                {phase === "uploading" && (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-[330px] flex-col justify-center gap-4"
                  >
                    {(droppedName
                      ? [{ name: droppedName, size: "2.8 MB", pages: 48 }]
                      : DEMO_FILES
                    ).map((f) => (
                      <div
                        key={f.name}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <div className="mb-2.5 flex items-center gap-2.5">
                          <FileText size={16} className="text-mist-500" />
                          <span className="flex-1 truncate text-sm text-mist-100">
                            {f.name}
                          </span>
                          <span className="font-mono text-[11px] text-mist-700">
                            {f.size}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            className="h-full rounded-full bg-signal-500"
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {phase === "pipeline" && (
                  <motion.div
                    key="pipeline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-[330px] flex-col justify-center gap-2.5"
                  >
                    {STAGES.map((stage, i) => {
                      const Icon = stage.icon;
                      const done = i < stageIndex;
                      const active = i === stageIndex;
                      return (
                        <div
                          key={stage.key}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${
                            active
                              ? "border-signal-500/40 bg-signal-500/[0.06]"
                              : done
                              ? "border-white/[0.06] bg-white/[0.02] opacity-70"
                              : "border-white/[0.04] bg-transparent opacity-35"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              done
                                ? "bg-vector-500/15 text-vector-400"
                                : active
                                ? "bg-signal-500/15 text-signal-400"
                                : "bg-white/5 text-mist-700"
                            }`}
                          >
                            <Icon size={15} />
                          </span>
                          <span
                            className={`text-sm ${
                              active || done ? "text-mist-100" : "text-mist-700"
                            }`}
                          >
                            {stage.label}
                          </span>
                          {active && i !== STAGES.length - 1 && (
                            <span className="ml-auto h-1.5 w-1.5 animate-pulseDot rounded-full bg-signal-400" />
                          )}
                          {(done || (active && i === STAGES.length - 1)) && (
                            <CheckCircle2
                              size={15}
                              className="ml-auto text-vector-400"
                            />
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {phase === "answering" && (
                  <motion.div
                    key="answering"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-[330px] flex-col justify-between"
                  >
                    <div className="space-y-3 overflow-hidden">
                      <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-signal-500/15 px-4 py-2.5 text-sm text-mist-100">
                        What are the terms of this raise?
                      </div>
                      <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-mist-300">
                        {answerNodes}
                        {visibleWords <
                          ANSWER.reduce(
                            (a, s) => a + s.t.split(" ").length,
                            0
                          ) && (
                          <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-signal-400 align-middle" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                      <span className="flex-1 text-sm text-mist-700">
                        Ask anything about this document…
                      </span>
                      <span className="rounded-lg bg-signal-500/15 p-1.5 text-signal-400">
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MiniPdfCard({ label, tone = "signal" }) {
  return (
    <div className="glass flex w-40 items-center gap-2.5 rounded-xl px-3.5 py-3">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          tone === "vector"
            ? "bg-vector-500/15 text-vector-400"
            : "bg-signal-500/15 text-signal-400"
        }`}
      >
        <FileText size={14} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-mist-100">{label}</p>
        <p className="text-[10px] text-mist-700">AI ready</p>
      </div>
    </div>
  );
}
