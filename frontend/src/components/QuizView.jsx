import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import api from "../api";
import ResultsModal from "./ResultsModal";

export default function QuizView({ docId }) {
  const [phase, setPhase] = useState("idle"); // idle | loading | quiz | submitting | results
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState(1);

  const generateQuiz = async () => {
    setPhase("loading");
    setError(null);
    setAnswers({});
    try {
      const res = await api.post(`/api/documents/${docId}/quiz/generate`);
      setQuestions(res.data);
      setCurrentIndex(0);
      setPhase("quiz");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate quiz.");
      setPhase("idle");
    }
  };

  const selectAnswer = (option) => {
    const q = questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const submitQuiz = async () => {
    setPhase("submitting");
    const stringifiedAnswers = {};
    Object.entries(answers).forEach(([k, v]) => { stringifiedAnswers[String(k)] = v; });
    try {
      const res = await api.post("/api/evaluate", {
        document_id: docId,
        answers: stringifiedAnswers,
      });
      setResults(res.data);
      setPhase("results");
    } catch (err) {
      setError(err.response?.data?.detail || "Evaluation failed.");
      setPhase("quiz");
    }
  };

  const q = questions[currentIndex];
  const answered = q ? answers[q.id] : null;
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Idle: generate button */}
      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-signal-500/10 text-signal-400">
            <Sparkles size={28} />
          </div>
          <div>
            <p className="text-lg font-medium text-mist-100">Generate a Quiz</p>
            <p className="mt-1.5 text-sm text-mist-700 max-w-xs">
              AI will create multiple-choice questions based on this document
            </p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={generateQuiz} className="btn-primary">
            <Sparkles size={15} />
            Generate Quiz
          </button>
        </div>
      )}

      {/* Loading */}
      {phase === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Loader2 size={36} className="animate-spin text-signal-400" />
          <p className="text-sm text-mist-500">Generating questions…</p>
        </div>
      )}

      {/* Quiz */}
      {(phase === "quiz" || phase === "submitting") && q && (
        <div className="flex flex-1 flex-col">
          {/* Progress */}
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-xs text-mist-700">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Object.keys(answers).length} answered</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-signal-500"
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="flex flex-col gap-3"
              >
                {/* Topic badge */}
                {q.topic && (
                  <span className="eyebrow text-signal-400">{q.topic}</span>
                )}

                {/* Question */}
                <p className="text-base font-medium leading-snug text-mist-100">
                  {q.question}
                </p>

                {/* Options */}
                <div className="mt-2 grid gap-2.5">
                  {(q.options || []).map((option, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(option)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                        answered === option
                          ? "border-signal-500/60 bg-signal-500/10 text-mist-100 shadow-glow"
                          : "border-white/[0.07] bg-white/[0.02] text-mist-300 hover:border-signal-500/30 hover:bg-signal-500/[0.04]"
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
                        answered === option
                          ? "border-signal-500 bg-signal-500 text-ink-950"
                          : "border-white/[0.15] text-mist-700"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="btn-secondary px-5 py-2.5 text-xs disabled:opacity-30"
            >
              Back
            </button>

            <div className="flex gap-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === currentIndex
                      ? "w-5 bg-signal-500"
                      : answers[questions[i]?.id]
                      ? "w-1.5 bg-vector-500"
                      : "w-1.5 bg-white/[0.12]"
                  }`}
                />
              ))}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={goNext}
                className="btn-secondary px-5 py-2.5 text-xs"
              >
                Next
                <ChevronRight size={13} />
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={!allAnswered || phase === "submitting"}
                className="btn-primary px-5 py-2.5 text-xs disabled:opacity-40"
              >
                {phase === "submitting" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={13} />
                )}
                Submit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Modal */}
      <AnimatePresence>
        {phase === "results" && results && (
          <ResultsModal
            results={results}
            onClose={() => setPhase("idle")}
            onRetry={() => {
              setAnswers({});
              setCurrentIndex(0);
              setPhase("quiz");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
