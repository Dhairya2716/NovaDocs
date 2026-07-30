import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronLeft, ChevronRight, RotateCw, Loader2, Download } from "lucide-react";
import api from "../api";

/** Export cards in Anki's plain-text import format: front<TAB>back per line */
function exportToAnki(cards, filename = "flashcards") {
  const lines = cards.map((c) => `${c.front}\t${c.back}`).join("\n");
  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename.replace(/\.pdf$/i, "")}_anki.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function FlashCard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="card-flip-container w-full" style={{ height: 280 }}>
      <div
        className={`card-flip-inner w-full h-full cursor-pointer ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* Front */}
        <div className="card-face glass rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          {card.topic && (
            <span className="eyebrow mb-3 text-signal-400">{card.topic}</span>
          )}
          <p className="text-base font-medium text-mist-100 leading-snug">
            {card.front}
          </p>
          <p className="mt-4 text-xs text-mist-700">
            Tap to reveal answer
          </p>
        </div>

        {/* Back */}
        <div className="card-face card-back rounded-2xl border border-signal-500/30 bg-signal-500/[0.06] p-8 flex flex-col items-center justify-center text-center">
          {card.topic && (
            <span className="eyebrow mb-3 text-signal-400">{card.topic}</span>
          )}
          <p className="text-base leading-relaxed text-mist-200">
            {card.back}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardView({ docId }) {
  const [phase, setPhase] = useState("idle");
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState(1);

  const generateCards = async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await api.post(`/api/documents/${docId}/flashcards/generate`);
      setCards(res.data);
      setIndex(0);
      setPhase("cards");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate flashcards.");
      setPhase("idle");
    }
  };

  const go = (delta) => {
    setDirection(delta);
    setIndex((i) => Math.max(0, Math.min(cards.length - 1, i + delta)));
  };

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, scale: 0.96 }),
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Idle */}
      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-vector-500/10 text-vector-400">
            <Layers size={28} />
          </div>
          <div>
            <p className="text-lg font-medium text-mist-100">Generate Flashcards</p>
            <p className="mt-1.5 text-sm text-mist-700 max-w-xs">
              Key concepts from this document turned into study cards
            </p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={generateCards} className="btn-primary">
            <Layers size={15} />
            Generate Flashcards
          </button>
        </div>
      )}

      {/* Loading */}
      {phase === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Loader2 size={36} className="animate-spin text-signal-400" />
          <p className="text-sm text-mist-500">Creating flashcards…</p>
        </div>
      )}

      {/* Cards */}
      {phase === "cards" && cards.length > 0 && (
        <div className="flex flex-1 flex-col gap-4">
          {/* Counter + regen + export */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-mist-700">
              {index + 1} <span className="text-mist-700">/</span> {cards.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToAnki(cards)}
                className="btn-ghost text-xs gap-1.5"
                title="Download as Anki import file"
              >
                <Download size={12} />
                Anki
              </button>
              <button
                onClick={() => { setPhase("idle"); setCards([]); }}
                className="btn-ghost text-xs gap-1.5"
              >
                <RotateCw size={12} />
                Regenerate
              </button>
            </div>
          </div>

          {/* Card */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <FlashCard card={cards[index]} index={index} total={cards.length} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot nav */}
          <div className="flex items-center justify-center gap-1">
            {cards.slice(0, Math.min(cards.length, 12)).map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                className={`rounded-full transition-all duration-200 ${
                  i === index
                    ? "h-1.5 w-4 bg-signal-500"
                    : "h-1.5 w-1.5 bg-white/[0.15]"
                }`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between">
            <button
              onClick={() => go(-1)}
              disabled={index === 0}
              className="btn-secondary px-5 py-2.5 text-xs gap-1.5 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <button
              onClick={() => go(1)}
              disabled={index === cards.length - 1}
              className="btn-secondary px-5 py-2.5 text-xs gap-1.5 disabled:opacity-30"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
