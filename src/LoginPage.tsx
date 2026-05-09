import * as React from "react";
import { cn } from "./lib/utils";
import { Lock, ShieldCheck } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password 'admin123' - can be changed
    if (password === "admin123") {
      onLogin();
    } else {
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 maritime-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Basketball Scoring</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Admin Control Center</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Access Password</label>
            <div className="relative">
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full bg-slate-950 border rounded-xl py-4 px-5 text-white focus:outline-none transition-all",
                  error ? "border-red-500 animate-shake" : "border-slate-800 focus:border-amber-500"
                )}
                placeholder="Enter password..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full maritime-gradient hover:opacity-90 py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Authorize Access
          </button>
          
          {error && (
            <p className="text-red-500 text-xs font-bold text-center uppercase tracking-wider animate-pulse">
              Invalid credentials. Please try again.
            </p>
          )}
        </form>

        <p className="text-center text-slate-600 text-[10px] mt-12 font-bold uppercase tracking-widest">
           &copy; 2024 DBC Production | Professional Broadcast Tools
        </p>
      </div>
    </div>
  );
}
