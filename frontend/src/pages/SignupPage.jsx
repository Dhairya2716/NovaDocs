import { useState, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import api from "../api";

const ThreeExplosion = lazy(() => import("../components/ThreeExplosion"));

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [shaking, setShaking] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/signup", { username, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 flex items-center justify-center px-4">
      {/* Three.js explosion background */}
      <Suspense fallback={null}>
        <ThreeExplosion />
      </Suspense>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(7,8,12,0.85) 100%)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full max-w-md glass-heavy rounded-2xl p-8 ${
          shaking ? "animate-shake" : ""
        }`}
      >
        {/* Logo */}
        <div className="mb-7 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-500 shadow-glow">
            <BookOpen size={22} className="text-ink-950" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-medium text-mist-100">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-mist-700">
              Start studying smarter with NovaDocs
            </p>
          </div>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-6 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vector-500/15 text-vector-400">
              <CheckCircle2 size={28} />
            </div>
            <p className="font-medium text-mist-100">Account created!</p>
            <p className="text-sm text-mist-700">
              Redirecting you to login…
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">
                Username
              </label>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="choose_a_username"
                required
                autoComplete="username"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min. 6 characters"
                  required
                  autoComplete="new-password"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mist-700 hover:text-mist-400 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">
                Confirm password
              </label>
              <input
                id="signup-confirm"
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="repeat password"
                required
                autoComplete="new-password"
                className="input-field"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400"
              >
                {error}
              </motion.p>
            )}

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-mist-700">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-signal-400 hover:text-signal-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
