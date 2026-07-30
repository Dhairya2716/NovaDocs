import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  BookOpen,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import api from "../api";
import DocCard from "../components/DocCard";
import UploadZone from "../components/UploadZone";
import Nav from "../components/Nav";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/api/documents");
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Poll while any doc is processing
  useEffect(() => {
    const hasProcessing = docs.some(
      (d) => d.status === "processing" || d.status === "uploaded"
    );
    if (!hasProcessing) return;
    const id = setInterval(() => fetchDocs(true), 3000);
    return () => clearInterval(id);
  }, [docs, fetchDocs]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />

      {/* Aurora bg */}
      <div className="pointer-events-none fixed inset-0 bg-aurora opacity-60" />

      <main className="relative mx-auto max-w-5xl px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-start justify-between gap-4"
        >
          <div>
            <p className="eyebrow text-signal-400 mb-1">{greeting}</p>
            <h1 className="font-display text-3xl font-medium text-mist-100">
              {user?.username || "Your"}'s Library
            </h1>
            <p className="mt-1.5 text-sm text-mist-700">
              {docs.length} document{docs.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => fetchDocs(true)}
            disabled={refreshing}
            className="btn-ghost gap-2"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </motion.div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mb-8"
        >
          <UploadZone onUploaded={() => setTimeout(() => fetchDocs(true), 800)} />
        </motion.div>

        {/* Document grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-5 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.04]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded-full bg-white/[0.04]" />
                    <div className="h-2.5 w-1/3 rounded-full bg-white/[0.04]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] text-mist-700">
              <FileText size={28} />
            </div>
            <p className="text-sm text-mist-700">
              No documents yet — upload your first PDF above
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {docs.map((doc, i) => (
              <motion.div
                key={doc.doc_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <DocCard doc={doc} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
