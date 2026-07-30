import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, BookOpen } from "lucide-react";
import useAuthStore from "../store/authStore";

const LANDING_NAV = [
  { href: "#top", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#pipeline", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  const isLanding = location.pathname === "/";
  const isAuth = location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-500 ${
        scrolled || !isLanding
          ? "glass-heavy border-b border-white/[0.06]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-signal-500 transition-all duration-200 group-hover:shadow-glow">
            <BookOpen size={16} className="text-ink-950" />
          </div>
          <span className="font-display text-lg font-medium text-mist-100 tracking-tight">
            NovaDocs
          </span>
        </Link>

        {/* Landing nav links */}
        {isLanding && (
          <nav className="hidden items-center gap-6 md:flex">
            {LANDING_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-mist-700 transition-colors hover:text-mist-100"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right side CTA */}
        <div className="flex items-center gap-3">
          {isAuth ? null : token ? (
            <>
              {/* Authenticated */}
              <Link
                to="/dashboard"
                className={`btn-ghost hidden items-center gap-2 md:inline-flex ${
                  location.pathname === "/dashboard" ? "text-signal-400" : ""
                }`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-xs text-mist-700">
                  {user?.username}
                  {user?.role === "admin" && (
                    <span className="ml-1 rounded-full bg-signal-500/20 px-1.5 py-0.5 text-[10px] font-medium text-signal-400">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-ghost gap-1.5 text-mist-700"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Not authenticated */}
              <Link to="/login" className="btn-ghost hidden md:inline-flex">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary hidden md:inline-flex">
                Get started
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden btn-ghost"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/[0.06] glass-heavy md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {isLanding &&
                LANDING_NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm text-mist-500 hover:bg-white/[0.04] hover:text-mist-100 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              {token ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm text-mist-500 hover:bg-white/[0.04] hover:text-mist-100 transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="rounded-xl px-3 py-2.5 text-left text-sm text-mist-500 hover:bg-white/[0.04] hover:text-mist-100 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm text-mist-500 hover:bg-white/[0.04] hover:text-mist-100 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary mt-1 justify-start"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
