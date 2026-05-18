import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import DiamondBackground from "@/components/DiamondBackground";

// ── Chicken-in-house logo ─────────────────────────────────────────────────────
function ChickenHouseLogo() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* House shadow / base */}
      <ellipse cx="48" cy="86" rx="32" ry="5" fill="hsl(33,85%,45%)" opacity="0.12" />

      {/* House walls */}
      <rect x="14" y="46" width="68" height="42" rx="3" fill="hsl(38,30%,98%)" stroke="hsl(35,20%,85%)" strokeWidth="1.5" />

      {/* House roof */}
      <path d="M8 48 L48 14 L88 48Z" fill="hsl(33,85%,45%)" />
      <path d="M8 48 L48 14 L88 48Z" stroke="hsl(33,75%,38%)" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Roof ridge cap */}
      <rect x="42" y="12" width="12" height="6" rx="2" fill="hsl(20,72%,52%)" />

      {/* Door */}
      <rect x="40" y="64" width="16" height="24" rx="2" fill="hsl(33,85%,45%)" opacity="0.25" stroke="hsl(33,85%,45%)" strokeWidth="1" />
      <circle cx="53" cy="76" r="1.5" fill="hsl(33,75%,38%)" />

      {/* Window left */}
      <rect x="19" y="54" width="14" height="12" rx="2" fill="hsl(43,90%,75%)" opacity="0.6" stroke="hsl(35,20%,85%)" strokeWidth="1" />
      <line x1="26" y1="54" x2="26" y2="66" stroke="hsl(35,20%,75%)" strokeWidth="0.8" />
      <line x1="19" y1="60" x2="33" y2="60" stroke="hsl(35,20%,75%)" strokeWidth="0.8" />

      {/* Window right */}
      <rect x="63" y="54" width="14" height="12" rx="2" fill="hsl(43,90%,75%)" opacity="0.6" stroke="hsl(35,20%,85%)" strokeWidth="1" />
      <line x1="70" y1="54" x2="70" y2="66" stroke="hsl(35,20%,75%)" strokeWidth="0.8" />
      <line x1="63" y1="60" x2="77" y2="60" stroke="hsl(35,20%,75%)" strokeWidth="0.8" />

      {/* ── Chicken body (peeking from door) ── */}
      {/* Body */}
      <ellipse cx="48" cy="72" rx="9" ry="7" fill="hsl(33,90%,58%)" />
      {/* Head */}
      <circle cx="48" cy="62" r="6" fill="hsl(33,90%,58%)" />
      {/* Beak */}
      <polygon points="48,64 44,65.5 48,67" fill="hsl(20,85%,50%)" />
      {/* Eye */}
      <circle cx="50" cy="61" r="1.8" fill="hsl(25,35%,12%)" />
      <circle cx="50.6" cy="60.4" r="0.6" fill="white" />
      {/* Comb */}
      <path d="M45 56.5 Q47 53.5 49 56.5 Q51 53.5 53 56.5" stroke="hsl(0,75%,55%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Wattle */}
      <ellipse cx="45.5" cy="66" rx="1.8" ry="2.5" fill="hsl(0,75%,55%)" />
      {/* Wing hint */}
      <path d="M40 70 Q44 66 52 69" stroke="hsl(25,80%,45%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      setAuth(res.data.user, res.data.access, res.data.refresh);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <DiamondBackground />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* ── Logo block above card ── */}
        <div className="flex flex-col items-center mb-6 animate-fade-in">
          <ChickenHouseLogo />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Poultry ERP</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Farm Management System</p>
        </div>

        {/* ── Card ── */}
        <div
          className="rounded-2xl border border-border bg-card shadow-xl animate-fade-in"
          style={{ animationDelay: "0.05s" }}
        >
          {/* Card header strip */}
          <div className="px-8 pt-7 pb-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Sign in to your account</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Enter your credentials below to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/8 border border-destructive/20 px-3 py-2.5">
                <svg className="h-4 w-4 text-destructive shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Poultry ERP v1.0 · Farm Management System
        </p>
      </div>
    </div>
  );
}
