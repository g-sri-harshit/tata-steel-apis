"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, Shield } from "lucide-react";
import { authAPI } from "@/lib/api";

const DEMO_CREDENTIALS = [
  { email: "admin@tatasteel.com",    password: "TataSteel@2025", role: "Plant Director" },
  { email: "engineer@tatasteel.com", password: "Engineer@2025",  role: "Senior Engineer" },
  { email: "manager@tatasteel.com",  password: "Manager@2025",   role: "Operations Manager" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authAPI.login(email, password);
      const { access_token, user } = res.data;
      localStorage.setItem("apis_token", access_token);
      localStorage.setItem("apis_user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err: any) {
      // Demo mode: allow any of the demo credentials locally
      const demo = DEMO_CREDENTIALS.find(c => c.email === email && c.password === password);
      if (demo) {
        localStorage.setItem("apis_token", "demo-token-" + Date.now());
        localStorage.setItem("apis_user", JSON.stringify({
          id: "usr_demo",
          email: demo.email,
          name: demo.email.split("@")[0].charAt(0).toUpperCase() + demo.email.split("@")[0].slice(1),
          role: demo.role,
          plant: "All Plants",
        }));
        router.push("/dashboard");
        return;
      }
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4" style={{
      background: "radial-gradient(ellipse at 30% 20%, #1e1b4b30 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, #1a0a0020 0%, transparent 60%), #0f1117"
    }}>
      {/* Grid overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-steel-500 to-steel-700 mb-4 glow-steel">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tata Steel</h1>
          <p className="text-steel-400 font-semibold text-sm mt-0.5 tracking-widest uppercase">Autonomous Plant Intelligence</p>
          <p className="text-muted-foreground text-xs mt-2">APIS v1.0 — Enterprise Edition</p>
        </div>

        {/* Card */}
        <div className="card-glass rounded-2xl p-7 border border-card-border">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in to APIS</h2>
          <p className="text-muted-foreground text-sm mb-6">Access your plant intelligence dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@tatasteel.com"
                  className="w-full bg-card border border-card-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-steel-500 focus:ring-1 focus:ring-steel-500/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-card border border-card-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-steel-500 focus:ring-1 focus:ring-steel-500/30 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-steel-600 hover:bg-steel-500 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-all duration-150 flex items-center justify-center gap-2 glow-steel mt-2"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Authenticating…</> : "Sign In"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-card-border/40">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Demo Access</p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((c) => (
                <button
                  key={c.email}
                  onClick={() => fillDemo(c)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-card hover:bg-card-hover border border-card-border hover:border-steel-600/30 transition-all"
                >
                  <div className="text-xs font-medium text-white">{c.role}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          © 2025 Tata Steel Limited · APIS Platform · All rights reserved
        </p>
      </div>
    </div>
  );
}
