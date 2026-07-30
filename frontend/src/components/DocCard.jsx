import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";

function StatusBadge({ status }) {
  if (status === "completed") {
    return (
      <span className="status-ready">
        <CheckCircle2 size={10} />
        Ready
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="status-error">
        <AlertCircle size={10} />
        Error
      </span>
    );
  }
  return (
    <span className="status-processing">
      <span className="h-1.5 w-1.5 rounded-full bg-signal-400 animate-pulseDot" />
      {status === "uploaded" ? "Queued" : "Processing"}
    </span>
  );
}

export default function DocCard({ doc }) {
  const navigate = useNavigate();
  const isReady = doc.status === "completed";

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => isReady && navigate(`/doc/${doc.doc_id}`)}
      className={`glass rounded-2xl p-5 transition-shadow duration-300 ${
        isReady
          ? "cursor-pointer hover:shadow-glow hover:border-signal-500/30"
          : "cursor-default opacity-80"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isReady
              ? "bg-signal-500/15 text-signal-400"
              : "bg-white/[0.05] text-mist-700"
          }`}
        >
          <FileText size={18} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-mist-100">
            {doc.filename}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <StatusBadge status={doc.status} />
            {doc.is_global && (
              <span className="rounded-full border border-vector-500/30 bg-vector-500/10 px-2 py-0.5 text-[10px] font-medium text-vector-400">
                Global
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        {isReady && (
          <ChevronRight size={16} className="mt-1 shrink-0 text-mist-700" />
        )}
      </div>

      {/* Processing shimmer bar */}
      {(status === "processing" || doc.status === "uploaded") && (
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-signal-500/60"
            style={{
              width: "40%",
              animation: "shimmer 1.5s ease-in-out infinite",
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(232,168,56,0.6), transparent)",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
