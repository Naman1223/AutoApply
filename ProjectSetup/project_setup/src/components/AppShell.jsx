import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  Settings,
  Bot,
  ChevronDown,
} from "lucide-react";

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, profile } = useAuth();
  const [agentRunning, setAgentRunning] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // session === undefined means still loading from localStorage
  useEffect(() => {
    if (session === null) {
      // Definitively no session — redirect to login
      navigate("/");
    }
  }, [session, navigate]);

  // While session is being read, show nothing (avoids flash redirect)
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 260), oklch(0.5 0.22 285))" }}
          >
            <Bot size={20} className="text-white" />
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "oklch(0.55 0.2 260)", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  if (session === null) return null; // navigating away

  const userEmail = session.user?.email || "";
  const displayName = profile?.name || userEmail.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ background: "oklch(0.12 0.01 260 / 0.9)", borderColor: "oklch(0.25 0.02 260)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 260), oklch(0.5 0.22 285))" }}
            >
              <Bot size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight hidden sm:block">
              AutoApply
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = location.pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: active ? "oklch(0.25 0.04 260)" : "transparent",
                    color: active ? "oklch(0.85 0.05 260)" : "oklch(0.6 0.02 260)",
                  }}
                >
                  <Icon size={15} />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Agent toggle */}
            <button
              onClick={() => setAgentRunning(!agentRunning)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: agentRunning ? "oklch(0.22 0.06 145)" : "oklch(0.22 0.02 260)",
                color: agentRunning ? "oklch(0.72 0.2 145)" : "oklch(0.5 0.02 260)",
                border: `1px solid ${agentRunning ? "oklch(0.35 0.1 145)" : "oklch(0.3 0.02 260)"}`,
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${agentRunning ? "animate-pulse" : ""}`}
                style={{ background: agentRunning ? "oklch(0.72 0.2 145)" : "oklch(0.4 0.02 260)" }}
              />
              Agent {agentRunning ? "Running" : "Paused"}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 260), oklch(0.5 0.22 285))" }}
                >
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-white text-xs">{initials}</span>
                  }
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown size={14} className="hidden sm:block text-muted-foreground" />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 w-44 rounded-xl border shadow-xl py-1 z-50"
                    style={{ background: "oklch(0.18 0.015 260)", borderColor: "oklch(0.28 0.02 260)" }}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: "oklch(0.25 0.02 260)" }}>
                      <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <Settings size={14} /> Settings
                    </Link>
                    <div style={{ borderTop: "1px solid oklch(0.25 0.02 260)" }} className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-white/5 transition-colors"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
