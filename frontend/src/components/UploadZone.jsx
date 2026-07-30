import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X } from "lucide-react";
import api from "../api";

export default function UploadZone({ onUploaded }) {
  const [phase, setPhase] = useState("idle"); // idle | dragging | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      setPhase("error");
      return;
    }
    setFileName(file.name);
    setError(null);
    setPhase("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 50;
          setProgress(pct);
        },
      });
      setProgress(100);
      setPhase("done");
      onUploaded && onUploaded(res.data.document_id);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setProgress(0);
    setFileName(null);
    setError(null);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setPhase("dragging"); }}
      onDragLeave={() => phase === "dragging" && setPhase("idle")}
      onDrop={(e) => {
        e.preventDefault();
        uploadFile(e.dataTransfer?.files?.[0]);
      }}
      onClick={() => phase === "idle" && inputRef.current?.click()}
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 p-10 text-center cursor-pointer select-none
        ${phase === "dragging" ? "border-signal-500/80 bg-signal-500/[0.06] shadow-glow" : "border-white/[0.10] bg-white/[0.02] hover:border-signal-500/40 hover:bg-signal-500/[0.03]"}
        ${phase === "uploading" ? "border-signal-500/40 cursor-default" : ""}
        ${phase === "done" ? "border-vector-500/60 bg-vector-500/[0.04]" : ""}
        ${phase === "error" ? "border-red-500/50 bg-red-500/[0.03]" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => uploadFile(e.target.files?.[0])}
      />

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-500/10 text-signal-400">
              <UploadCloud size={26} />
            </div>
            <p className="text-sm font-medium text-mist-100">
              Drag &amp; drop your PDF here
            </p>
            <p className="text-xs text-mist-700">
              or click to browse · max 20 MB
            </p>
          </motion.div>
        )}

        {phase === "dragging" && (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-500/20 text-signal-400 animate-bounce">
              <UploadCloud size={28} />
            </div>
            <p className="text-sm font-semibold text-signal-400">
              Drop it!
            </p>
          </motion.div>
        )}

        {phase === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-signal-400" />
              <span className="max-w-xs truncate text-sm text-mist-100">
                {fileName}
              </span>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-signal-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-xs text-mist-700">{progress}% uploaded</p>
            </div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vector-500/15 text-vector-400">
              <UploadCloud size={26} />
            </div>
            <p className="text-sm font-medium text-vector-400">
              Uploaded — processing started
            </p>
            <button onClick={(e) => { e.stopPropagation(); reset(); }}
              className="btn-ghost text-xs">
              Upload another
            </button>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <X size={22} />
            </div>
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={(e) => { e.stopPropagation(); reset(); }}
              className="btn-ghost text-xs">
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
