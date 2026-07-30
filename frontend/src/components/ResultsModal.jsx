import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronRight, CheckCircle2, XCircle, RotateCcw, BookOpen } from "lucide-react";

export default function ResultsModal({ results, onClose, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);
  const { score, total, topic_breakdown, results: items } = results;
  const pct = Math.round((score / total) * 100);

  const grade =
    pct >= 90 ? "Excellent" :
    pct >= 75 ? "Great" :
    pct >= 60 ? "Good" :
    pct >= 40 ? "Keep going" : "Need more review";

  const gradeColor =
    pct >= 75 ? "text-vector-400" :
    pct >= 50 ? "text-signal-400" : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-heavy relative w-full max-w-lg rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-signal-500/15 text-signal-400 mb-4">
            <Trophy size={32} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className={`text-5xl font-bold ${gradeColor} font-display`}>
              {pct}%
            </p>
            <p className="mt-1 text-sm text-mist-500">
              {score} / {total} correct
            </p>
            <p className={`mt-2 text-base font-medium ${gradeColor}`}>
              {grade}
            </p>
          </motion.div>
        </div>

        {/* Topic breakdown */}
        {Object.keys(topic_breakdown).length > 0 && (
          <div className="mt-4 space-y-2.5">
            <p className="eyebrow mb-3">Topic Breakdown</p>
            {Object.entries(topic_breakdown).map(([topic, stat]) => {
              const topicPct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={topic}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-mist-300 truncate max-w-[70%]">{topic}</span>
                    <span className="text-mist-700">
                      {stat.correct}/{stat.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topicPct}%` }}
                      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        topicPct >= 70 ? "bg-vector-500" : topicPct >= 40 ? "bg-signal-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toggle detailed review */}
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-mist-300 hover:bg-white/[0.03] transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen size={14} />
            Question Review
          </div>
          <ChevronRight
            size={14}
            className={`transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`}
          />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              {items.map((item, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 text-sm ${
                    item.is_correct
                      ? "border-vector-500/25 bg-vector-500/[0.04]"
                      : "border-red-500/25 bg-red-500/[0.04]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {item.is_correct ? (
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-vector-400" />
                    ) : (
                      <XCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-mist-100">{item.question}</p>
                      {!item.is_correct && (
                        <p className="mt-1 text-xs text-mist-700">
                          Your answer:{" "}
                          <span className="text-red-400">{item.selected || "—"}</span>
                          {" · "}Correct:{" "}
                          <span className="text-vector-400">{item.correct_answer}</span>
                        </p>
                      )}
                      {item.explanation && (
                        <p className="mt-1.5 text-xs text-mist-500 leading-relaxed">
                          {item.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button onClick={onRetry} className="btn-secondary flex-1 gap-2">
            <RotateCcw size={14} />
            Retry Quiz
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
