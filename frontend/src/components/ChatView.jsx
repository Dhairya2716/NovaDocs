import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Zap,
  Mic,
  MicOff,
  ChevronDown,
  FileText,
  AlertCircle,
} from "lucide-react";
import api from "../api";

/* ─── Confidence badge ─────────────────────────────────────────────────────── */
function ConfidenceBadge({ score }) {
  const high = score >= 0.7;
  const mid = score >= 0.4;
  const label = high ? "High confidence" : mid ? "Moderate confidence" : "Low confidence";
  const color = high
    ? "text-vector-400 border-vector-500/30 bg-vector-500/[0.06]"
    : mid
    ? "text-signal-400 border-signal-500/30 bg-signal-500/[0.06]"
    : "text-mist-700 border-white/[0.08] bg-white/[0.02]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] ${color}`}
      title={`Average chunk similarity: ${score}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          high ? "bg-vector-400" : mid ? "bg-signal-400 animate-pulseDot" : "bg-mist-700"
        }`}
      />
      {label} · {Math.round(score * 100)}%
    </span>
  );
}

/* ─── Sources panel ────────────────────────────────────────────────────────── */
function SourcesPanel({ sources }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] text-mist-700 hover:text-mist-400 transition-colors"
      >
        <FileText size={11} />
        {sources.length} source{sources.length !== 1 ? "s" : ""}
        <ChevronDown
          size={11}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 overflow-hidden space-y-1.5"
          >
            {sources.map((src, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-mist-700">
                    Chunk #{src.chunk_index}
                  </span>
                  <span
                    className={`font-mono text-[10px] ${
                      src.similarity >= 0.7
                        ? "text-vector-400"
                        : src.similarity >= 0.4
                        ? "text-signal-400"
                        : "text-mist-700"
                    }`}
                  >
                    {Math.round(src.similarity * 100)}% match
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-mist-500 line-clamp-3">
                  {src.content}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Single message ───────────────────────────────────────────────────────── */
function Message({ msg }) {
  const isAI = msg.role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isAI
            ? "bg-signal-500/15 text-signal-400"
            : "bg-white/[0.06] text-mist-500"
        }`}
      >
        {isAI ? <Bot size={15} /> : <User size={14} />}
      </div>

      {/* Content */}
      <div className={`max-w-[82%] ${isAI ? "" : "flex flex-col items-end"}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAI
              ? "rounded-tl-sm border border-white/[0.07] bg-white/[0.03] text-mist-200"
              : "rounded-tr-sm bg-signal-500/20 text-mist-100"
          }`}
        >
          {msg.text}
          {msg.typing && (
            <span className="ml-1 inline-block h-3.5 w-1 animate-pulse bg-signal-400 align-middle" />
          )}
        </div>

        {/* Confidence + Sources — only on completed AI messages */}
        {isAI && !msg.typing && !msg.streaming && msg.confidence != null && (
          <div className="mt-1.5 px-1">
            <ConfidenceBadge score={msg.confidence} />
            {msg.sources && msg.sources.length > 0 && (
              <SourcesPanel sources={msg.sources} />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Voice hook ───────────────────────────────────────────────────────────── */
function useVoiceInput(onTranscript) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    () => "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  );
  const recognitionRef = useRef(null);

  const toggle = useCallback(() => {
    if (!supported) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript || "";
      onTranscript(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, supported, onTranscript]);

  return { listening, supported, toggle };
}

/* ─── Main ChatView ────────────────────────────────────────────────────────── */
export default function ChatView({ docId }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I've read this document. Ask me anything about it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const { listening, supported, toggle: toggleVoice } = useVoiceInput(
    (transcript) => setInput((prev) => (prev ? prev + " " + transcript : transcript))
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    // Typing indicator
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "", typing: true, id: "typing" },
    ]);

    try {
      const res = await api.post("/api/chat", {
        document_id: docId,
        question: q,
      });
      const { answer, confidence, sources } = res.data;

      // Remove typing indicator
      setMessages((prev) => prev.filter((m) => m.id !== "typing"));

      // Typewriter reveal
      let revealed = "";
      const words = answer.split(" ");
      for (let i = 0; i < words.length; i++) {
        revealed += (i === 0 ? "" : " ") + words[i];
        const snap = revealed;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.streaming) {
            return [
              ...prev.slice(0, -1),
              { role: "ai", text: snap, streaming: true },
            ];
          }
          return [...prev, { role: "ai", text: snap, streaming: true }];
        });
        await new Promise((r) => setTimeout(r, 28));
      }

      // Finalise — attach confidence & sources now that streaming is done
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.streaming) {
          return [
            ...prev.slice(0, -1),
            { role: "ai", text: last.text, confidence, sources },
          ];
        }
        return prev;
      });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== "typing"));
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            err.response?.data?.detail ||
            "Something went wrong. Please try again.",
          confidence: null,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-white/[0.06] p-4">
        {/* Voice status banner */}
        <AnimatePresence>
          {listening && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mb-2 flex items-center gap-2 rounded-xl border border-signal-500/30 bg-signal-500/[0.06] px-3 py-1.5 text-xs text-signal-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-signal-400 animate-pulseDot" />
              Listening… speak now
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 transition-all duration-200 focus-within:border-signal-500/50 focus-within:shadow-glow">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask anything about this document…"
            className="flex-1 bg-transparent text-sm text-mist-100 placeholder-mist-700 outline-none"
            disabled={loading}
          />

          {/* Voice button */}
          {supported && (
            <button
              onClick={toggleVoice}
              disabled={loading}
              title={listening ? "Stop recording" : "Voice input"}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                listening
                  ? "bg-signal-500/30 text-signal-400 animate-pulse"
                  : "bg-white/[0.05] text-mist-700 hover:text-mist-300"
              }`}
            >
              {listening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          )}

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              input.trim() && !loading
                ? "bg-signal-500 text-ink-950 hover:bg-signal-400 active:scale-95"
                : "bg-white/[0.05] text-mist-700"
            }`}
          >
            {loading ? (
              <Zap size={14} className="animate-pulse" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>

        {/* Low-confidence hint */}
        {messages.length > 1 &&
          messages[messages.length - 1]?.confidence != null &&
          messages[messages.length - 1].confidence < 0.4 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center gap-1.5 text-[11px] text-mist-700"
            >
              <AlertCircle size={11} />
              Low match — this question may be outside the document's scope
            </motion.p>
          )}
      </div>
    </div>
  );
}
