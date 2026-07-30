import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../api";
import Nav from "../components/Nav";
import ChatView from "../components/ChatView";
import QuizView from "../components/QuizView";
import FlashcardView from "../components/FlashcardView";

const TABS = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "quiz", label: "Quiz", icon: HelpCircle },
  { key: "flashcards", label: "Flashcards", icon: Layers },
];

function StatusBadge({ status }) {
  if (status === "completed") {
    return (
      <span className="status-ready gap-1.5">
        <CheckCircle2 size={11} />
        Ready
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="status-error gap-1.5">
        <AlertCircle size={11} />
        Error
      </span>
    );
  }
  return (
    <span className="status-processing gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-signal-400 animate-pulseDot" />
      Processing…
    </span>
  );
}

export default function DocPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/api/documents/${id}`);
        setDoc(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  // Poll if not completed
  useEffect(() => {
    if (!doc || doc.status === "completed" || doc.status === "error") return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/documents/${id}`);
        setDoc(res.data);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [doc, id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 size={32} className="animate-spin text-signal-400" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-sm text-mist-500">Document not found.</p>
        <button onClick={() => navigate("/dashboard")} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />
      <div className="pointer-events-none fixed inset-0 bg-aurora opacity-40" />

      <main className="relative mx-auto max-w-4xl px-4 pt-24 pb-10">
        {/* Back + title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-ghost mb-4 gap-2 pl-0 text-mist-700"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl font-medium text-mist-100 flex-1 min-w-0 truncate">
              {doc.filename}
            </h1>
            <StatusBadge status={doc.status} />
          </div>

          {doc.status === "error" && doc.error && (
            <p className="mt-2 text-xs text-red-400">{doc.error}</p>
          )}
        </motion.div>

        {/* Tabs + content */}
        {doc.status === "completed" ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl overflow-hidden"
            style={{ minHeight: 520 }}
          >
            {/* Tab bar */}
            <div className="flex border-b border-white/[0.06] px-4 pt-4">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`mr-5 flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === key ? "tab-active" : "tab-inactive"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex flex-col" style={{ height: 480 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col h-full"
                >
                  {activeTab === "chat" && <ChatView docId={id} />}
                  {activeTab === "quiz" && <QuizView docId={id} />}
                  {activeTab === "flashcards" && <FlashcardView docId={id} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          // Still processing
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass flex flex-col items-center gap-5 rounded-2xl p-16 text-center"
          >
            <Loader2 size={36} className="animate-spin text-signal-400" />
            <div>
              <p className="font-medium text-mist-100">
                Processing your document
              </p>
              <p className="mt-1.5 text-sm text-mist-700">
                This usually takes 30–60 seconds. This page will auto-update.
              </p>
            </div>
          </motion.div>
        )}

        {/* Summary (if available) */}
        {doc.summary && doc.status === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 glass rounded-2xl p-5"
          >
            <p className="eyebrow text-signal-400 mb-2">Document Summary</p>
            <p className="text-sm leading-relaxed text-mist-500 line-clamp-4">
              {doc.summary}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
