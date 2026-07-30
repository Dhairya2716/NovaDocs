import { useState, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import api from "../api";
import useAuthStore from "../store/authStore";

const ThreeExplosion = lazy(() => import("../components/ThreeExplosion"));

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shaking, setShaking] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // FastAPI's OAuth2PasswordRequestForm expects form-encoded body
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);

      const res = await api.post("/api/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, role } = res.data;
      login(access_token, { username, role });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
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

      {/* Radial vignette overlay */}
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
        {/* Logo mark */}
        <div className="mb-7 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-500 shadow-glow">
            <BookOpen size={22} className="text-ink-950" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-medium text-mist-100">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-mist-700">
              Sign in to your NovaDocs account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-500">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
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
                id="login-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Link to signup */}
        <p className="mt-5 text-center text-sm text-mist-700">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-signal-400 hover:text-signal-300 transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
