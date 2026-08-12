import * as React from "react";
import { useScoreboard, formatTimer, defaultState, ScoreboardState } from "./store";
import { cn } from "./lib/utils";
import { Plus, Minus, RotateCcw, Play, Pause, Settings2, Keyboard, Upload, LogOut, ExternalLink, Lock, ShieldCheck, Sparkles, Zap, Copy, Check, Tv } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginPage from "./LoginPage";
import ImageDropInput from "./components/ImageDropInput";
import MotionOverlayBanner from "./components/MotionOverlayBanner";

interface AdminPageProps {
  onLogout: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export default function AdminPage({ onLogout, isAuthenticated, onLogin }: AdminPageProps) {
  const { state, updateState, setManualState } = useScoreboard();
  const [showLogin, setShowLogin] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [keybinds, setKeybinds] = React.useState({
    homePlus: 'q',
    homeMinus: 'a',
    awayPlus: 'p',
    awayMinus: 'l',
    timerToggle: ' ',
    reset: 'r',
    shotClock24: '1',
    shotClock14: '2',
    homeFoulPlus: 'f',
    awayFoulPlus: 'g'
  });

  const [isListening, setIsListening] = React.useState<string | null>(null);

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();
      
      if (isListening) {
        setKeybinds(prev => ({ ...prev, [isListening]: key }));
        setIsListening(null);
        return;
      }

      if (key === keybinds.homePlus) updateState(s => ({ ...s, home: { ...s.home, score: s.home.score + 1 } }));
      if (key === keybinds.homeMinus) updateState(s => ({ ...s, home: { ...s.home, score: Math.max(0, s.home.score - 1) } }));
      if (key === keybinds.awayPlus) updateState(s => ({ ...s, away: { ...s.away, score: s.away.score + 1 } }));
      if (key === keybinds.awayMinus) updateState(s => ({ ...s, away: { ...s.away, score: Math.max(0, s.away.score - 1) } }));
      if (key === keybinds.timerToggle) updateState(s => ({ ...s, timerActive: !s.timerActive }));
      if (key === keybinds.reset) if(confirm("Reset scoreboard?")) setManualState(defaultState);
      if (key === keybinds.shotClock24) updateState(s => ({ ...s, shotClock: 24 }));
      if (key === keybinds.shotClock14) updateState(s => ({ ...s, shotClock: 14 }));
      if (key === keybinds.homeFoulPlus) updateState(s => ({ ...s, home: { ...s.home, fouls: Math.min(5, s.home.fouls + 1) } }));
      if (key === keybinds.awayFoulPlus) updateState(s => ({ ...s, away: { ...s.away, fouls: Math.min(5, s.away.fouls + 1) } }));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keybinds, isListening, updateState, setManualState]);

  const [newSponsor, setNewSponsor] = React.useState({ name: '', logo: '', detail: '' });

  const handleFileUpload = (onUpload: (url: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpload(result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen text-white p-6 font-sans" style={{ backgroundColor: "#fef0d8" }}>
      <div className="max-w-[1240px] mx-auto space-y-6 pb-20">
        <header className="flex items-center justify-between border-b border-bento-border pb-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded flex items-center justify-center font-bold text-lg border border-white/20 shadow-lg" style={{ backgroundColor: "#fe8900" }}>W</div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase font-condensed">Basketball Scoring by DBC</h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live Broadcast Feed (Socket.io)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <button 
                onClick={() => setShowLogin(true)}
                className="text-[10px] bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 rounded font-black uppercase transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Lock className="w-3 h-3" />
                Login Admin
              </button>
            ) : (
              <button 
                onClick={onLogout}
                className="text-[10px] bg-red-600/10 hover:bg-red-600/20 text-red-500 px-3 py-1.5 rounded border border-red-500/20 font-bold uppercase transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            )}
            <a 
              href="/display" 
              target="_blank" 
              className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 font-bold uppercase transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-3 h-3" />
              Open Overlay
            </a>
          </div>
        </header>

        {/* Live Broadcast Overlay Link Box - ALWAYS VISIBLE */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <Tv className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xs md:text-sm font-black text-white uppercase tracking-[0.2em] font-condensed">Live Stream Overlay (OBS Studio / vMix)</h2>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold font-condensed">
                  Link ini digunakan sebagai browser source di software livestreaming Anda tanpa harus login email.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <a 
                href="/display" 
                target="_blank" 
                className="flex-1 md:flex-initial text-[10px] bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                Buka Link Overlay
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 bg-black/40 p-3 rounded-xl border border-slate-900">
            <div className="flex-1 flex items-center px-4 font-mono text-xs font-bold text-amber-400 overflow-x-auto select-all whitespace-nowrap bg-slate-950/80 rounded-lg py-2.5 border border-slate-900">
              {typeof window !== 'undefined' ? `${window.location.origin}/display` : '/display'}
            </div>
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/display` : '/display';
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={cn(
                "py-2.5 px-6 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 border",
                copied 
                  ? "bg-green-600/20 border-green-500 text-green-400" 
                  : "bg-blue-600 hover:bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-600/15"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Berhasil Disalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  Salin Link Overlay
                </>
              )}
            </button>
          </div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            💡 Tips: Masukkan resolusi <b className="text-slate-300">1920x1080</b> pada properti Browser Source di OBS Studio/vMix agar tampilan presisi dan proporsional.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-blue-500">Public Scoring Mode</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Basic scoreboard tools are unlocked. Login to manage Logos and Sponsors.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowLogin(true)}
              className="text-[10px] bg-blue-600 text-white px-4 py-2 rounded-lg font-black uppercase shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
            >
              Unlock Broadcast Tools
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overlay Production Setup - ADMIN ONLY */}
          <div className={cn("bento-card md:col-span-3", !isAuthenticated && "opacity-40 pointer-events-none grayscale-[0.8]")} style={{ backgroundColor: "#fd9400", borderColor: "#fe8a36" }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Overlay Production Setup</span>
              </div>
              {!isAuthenticated && <Lock className="w-4 h-4 text-amber-500" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Vertical Position</p>
                  <div className="flex gap-2">
                    {['top', 'bottom'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => updateState(s => ({ ...s, layout: { ...s.layout, position: pos as any } }))}
                        className={cn(
                          "flex-1 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all",
                          state.layout?.position === pos ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Horizontal Alignment</p>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateState(s => ({ ...s, layout: { ...s.layout, alignment: align as any } }))}
                        className={cn(
                          "flex-1 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all",
                          state.layout?.alignment === align ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Overlay Scale ({Math.round((state.layout?.scale || 1) * 100)}%)</p>
                  <input 
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={state.layout?.scale || 1}
                    onChange={(e) => updateState(s => ({ ...s, layout: { ...s.layout, scale: parseFloat(e.target.value) } }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Visibility</p>
                  <button
                    onClick={() => updateState(s => ({ ...s, layout: { ...s.layout, showSponsors: !s.layout.showSponsors } }))}
                    className={cn(
                      "w-full py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all mb-2",
                      state.layout?.showSponsors ? "bg-green-600/20 border-green-500/50 text-green-500" : "bg-red-600/20 border-red-500/50 text-red-500"
                    )}
                  >
                    {state.layout?.showSponsors ? "Sponsors: Visible" : "Sponsors: Hidden"}
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Chroma Backdrop</p>
                  <button
                    onClick={() => updateState(s => ({ ...s, layout: { ...s.layout, chromaKey: !s.layout?.chromaKey } }))}
                    className={cn(
                      "w-full py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all",
                      state.layout?.chromaKey ? "bg-green-500/20 border-green-500 text-green-400" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    {state.layout?.chromaKey ? "Backdrop: Green Screen" : "Backdrop: Standard"}
                  </button>
                </div>
              </div>

              {/* LIVE LAYOUT PREVIEW */}
              <div className="md:col-span-3">
                <div className="flex justify-between items-end mb-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live Production Preview</p>
                  <p className="text-[9px] text-blue-500/50 font-mono">Simulated 16:9 Canvas</p>
                </div>
                <div className="relative aspect-video rounded-xl border-2 border-slate-900 overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8),0_18px_36px_-18px_rgba(0,0,0,0.9)] group" style={{ backgroundColor: "#f2dfb4" }}>
                   {/* Chroma Background Pattern */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                   
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[40px] font-black text-black/5 uppercase tracking-[0.3em] transform -rotate-12 select-none">Preview Mode</span>
                   </div>

                   {/* Mock viewport container matching p-12 (scaled) in DisplayPage */}
                   <div className={cn(
                     "absolute inset-0 p-[2.5%] transition-all duration-500 flex flex-col",
                     state.layout?.position === 'top' ? "justify-start" : "justify-end",
                     state.layout?.alignment === 'left' ? "items-start" : state.layout?.alignment === 'right' ? "items-end" : "items-center"
                   )} style={{ backgroundColor: state.layout?.chromaKey ? "#00ff00" : "#ffffff" }}>
                       <div 
                        style={{ scale: (state.layout?.scale || 1) * 0.28 }} 
                        className={cn(
                          "transition-all duration-500 flex flex-col shadow-2xl",
                          state.layout?.alignment === 'left' && (state.layout?.position === 'top' ? "origin-top-left items-start" : "origin-bottom-left items-start"),
                          state.layout?.alignment === 'center' && (state.layout?.position === 'top' ? "origin-top items-center" : "origin-bottom items-center"),
                          state.layout?.alignment === 'right' && (state.layout?.position === 'top' ? "origin-top-right items-end" : "origin-bottom-right items-end")
                        )}
                      >
                         {/* PIXEL-PERFECT MINIATURE SCOREBOARD */}
                         <div className="flex h-24 bg-slate-900 rounded-t overflow-hidden shadow-2xl">
                            {/* Regional Logo Left (Host) */}
                            <div className="w-24 bg-gradient-to-br from-white via-white to-blue-50 flex flex-col items-center justify-center p-2 z-10 shrink-0 relative border-r border-black/10 shadow-[5px_0_15px_-5px_rgba(30,64,175,0.2)]">
                               <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 shadow-[0_-2px_10px_rgba(30,64,175,0.4)]" />
                               {state.branding?.hostLogo ? (
                                 <img 
                                   src={state.branding.hostLogo} 
                                   alt={state.branding.hostName || "Host"} 
                                   className="w-14 h-14 object-contain mb-1 drop-shadow-sm" 
                                   referrerPolicy="no-referrer"
                                 />
                               ) : (
                                  <div className="text-2xl font-black italic text-blue-800 mb-1">
                                    {state.branding?.hostName?.substring(0, 4) || "WKTB"}
                                  </div>
                               )}
                               <div className="text-[7.5px] uppercase tracking-[0.1em] font-black text-blue-800/80 leading-none">
                                 {state.branding?.hostName || "Kab. Wakatobi"}
                               </div>
                            </div>

                            {/* Center Scoring Block */}
                            <div className="flex-1 border-x border-white/10 flex items-center px-10 gap-10 text-white relative">
                              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5" />
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate w-28 text-center mb-0.5">
                                  {state.home.name || "HOME"}
                                </span>
                                <div className="flex items-center gap-4">
                                  {state.home.logo && <img src={state.home.logo} alt="" className="w-12 h-12 object-contain drop-shadow-lg" />}
                                  <div className="text-5xl font-black tabular-nums tracking-tighter drop-shadow-md">{state.home.score}</div>
                                  <div className={cn(
                                    "flex flex-col items-center justify-center min-w-[32px] h-10 px-2 rounded border font-black tabular-nums transition-colors",
                                    state.home.fouls >= 5 ? "bg-red-600 border-white/20 text-white" : "bg-black/40 border-white/5 text-slate-300"
                                  )}>
                                    <span className="text-[7px] uppercase tracking-tighter leading-none mb-1 opacity-60">FOULS</span>
                                    <span className="text-xl leading-none">{state.home.fouls}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 flex flex-col items-center justify-center border-x border-white/5 h-full px-6 bg-black/20">
                                <div className="text-4xl font-mono font-bold text-amber-500 bg-black/60 px-4 py-1 rounded border border-white/10 tabular-nums leading-none">
                                  {formatTimer(state.timer)}
                                </div>
                                <div className={cn(
                                  "text-2xl font-mono font-bold px-3 py-0.5 mt-1 rounded border tabular-nums",
                                  state.shotClock <= 5 ? "text-red-500 bg-red-950/40 border-red-500/50" : "text-amber-500 bg-black/40 border-white/5"
                                )}>
                                  {Math.ceil(state.shotClock)}
                                </div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">PERIOD {state.quarter}</div>
                                <div className="flex gap-4 mt-2">
                                  <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <div key={i} className={cn("w-2 h-2 rounded-sm", i < state.home.fouls ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-white/10")} />
                                    ))}
                                  </div>
                                  <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <div key={i} className={cn("w-2 h-2 rounded-sm", i < state.away.fouls ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-white/10")} />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate w-28 text-center mb-0.5">
                                  {state.away.name || "AWAY"}
                                </span>
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "flex flex-col items-center justify-center min-w-[32px] h-10 px-2 rounded border font-black tabular-nums transition-colors",
                                    state.away.fouls >= 5 ? "bg-red-600 border-white/20 text-white" : "bg-black/40 border-white/5 text-slate-300"
                                  )}>
                                    <span className="text-[7px] uppercase tracking-tighter leading-none mb-1 opacity-60">FOULS</span>
                                    <span className="text-xl leading-none">{state.away.fouls}</span>
                                  </div>
                                  <div className="text-5xl font-black tabular-nums tracking-tighter drop-shadow-md">{state.away.score}</div>
                                  {state.away.logo && <img src={state.away.logo} alt="" className="w-12 h-12 object-contain drop-shadow-lg" />}
                                </div>
                              </div>
                            </div>

                            {/* Owner Logo Right (DBC) */}
                            <div className="w-24 bg-gradient-to-bl from-white via-white to-amber-50 flex flex-col items-center justify-center p-2 z-10 shrink-0 relative border-l border-black/10 shadow-[-5px_0_15px_-5px_rgba(245,158,11,0.2)]" style={{ width: "118px", height: "102px" }}>
                               <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_-2px_10px_rgba(245,158,11,0.4)]" />
                               {state.branding?.ownerLogo ? (
                                  <img 
                                    src={state.branding.ownerLogo} 
                                    alt={state.branding.ownerName || "Owner"} 
                                    className="w-14 h-14 object-contain mb-1 drop-shadow-sm" 
                                    referrerPolicy="no-referrer"
                                  />
                               ) : (
                                  <div className="text-3xl font-black text-slate-800 italic mb-1">
                                    {state.branding?.ownerName?.substring(0, 3) || "DBC"}
                                  </div>
                               )}
                               <div className="text-[7.5px] uppercase tracking-[0.1em] font-black text-slate-800/80 leading-none">
                                  {state.branding?.ownerName || "Dinis BC"}
                               </div>
                            </div>
                         </div>
                         
                         {state.layout?.showSponsors && (
                            <div className="w-full bg-black flex items-center justify-center gap-12 overflow-hidden border-x border-b border-white/10 rounded-b shadow-2xl px-8 h-8">
                               <div className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em] shrink-0">SUPPORTED BY:</div>
                               <div className="flex-1 flex justify-center">
                                  <div className="flex items-center gap-3">
                                     <div className="w-4 h-4 bg-white/20 rounded-full" />
                                     <div className="w-24 h-2 bg-white/10 rounded-full" />
                                  </div>
                               </div>
                               <div className="text-white/20 text-[8px] font-bold px-4 border-l border-white/10 uppercase tracking-widest shrink-0">Wakatobi Basketball Championship</div>
                            </div>
                         )}
                      </div>
                   </div>
                   
                   {/* HUD Overlays */}
                   <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20" />
                    
                    {/* Interactive Motion Graphic Banner Preview */}
                    <div className={cn(
                       "absolute inset-x-0 flex justify-center pointer-events-none z-50 transition-all duration-500",
                       state.layout?.position === 'bottom' ? "top-[8%]" : "bottom-[8%]"
                    )}>
                       <MotionOverlayBanner
                          active={!!state.lowerThird?.active}
                          styleType={state.lowerThird?.style || "none"}
                          mainText={state.lowerThird?.mainText || ""}
                          subText={state.lowerThird?.subText || ""}
                          scale={0.3}
                       />
                    </div>
                   <div className="absolute inset-0 pointer-events-none border border-white/5" />
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Real-time Preview Engine</p>
                  <p className="text-[9px] text-blue-500/50 font-mono">1920x1080 Simulated Viewport</p>
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE MOTION OVERLAYS SECTION */}
          <div className={cn("bento-card md:col-span-3 border-l-4 border-l-amber-500", !isAuthenticated && "opacity-40 pointer-events-none grayscale-[0.8]")} style={{ backgroundColor: "#2e1a05", borderColor: "#fe8a36" }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] font-condensed">Live Broadcast Motion Overlay (Lower-Third)</h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold font-condensed">High-quality 60fps glassmorphic and glowing futuristic vector overlays</p>
                </div>
              </div>
              {!isAuthenticated && <Lock className="w-4 h-4 text-amber-500" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Presets / Templates */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">1. Quick Preset Styles</p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      updateState(s => ({
                        ...s,
                        lowerThird: {
                          active: true,
                          style: 'modern',
                          mainText: 'KUNJUNGI WEBSITE KAMI',
                          subText: 'WWW.DINISBC.COM'
                        }
                      }));
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1",
                      state.lowerThird?.style === 'modern' && state.lowerThird?.active
                        ? "bg-blue-600/20 border-blue-500 text-white animate-pulse" 
                        : "bg-black/30 border-slate-800 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-blue-400 font-sans">
                      <Zap className="w-3 h-3 text-blue-400 fill-blue-400/20" /> Modern & Teknologi
                    </span>
                    <span className="text-[8.5px] leading-relaxed opacity-80 font-medium">Futuristic glowing vector panel, sliding entrance with a metallic sweep.</span>
                  </button>

                  <button
                    onClick={() => {
                      updateState(s => ({
                        ...s,
                        lowerThird: {
                          active: true,
                          style: 'minimalist',
                          mainText: 'SHOP NOW AT',
                          subText: 'WWW.DINISBC.COM'
                        }
                      }));
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1",
                      state.lowerThird?.style === 'minimalist' && state.lowerThird?.active
                        ? "bg-rose-600/20 border-rose-500 text-white animate-pulse" 
                        : "bg-black/30 border-slate-800 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-rose-400 font-sans">
                      <Sparkles className="w-3 h-3 text-rose-400 fill-rose-400/20" /> Minimalis & Elegan
                    </span>
                    <span className="text-[8.5px] leading-relaxed opacity-80 font-medium">Frosted glassmorphism panel, ease-in bottom, gentle floating hover movement.</span>
                  </button>
                </div>
              </div>

              {/* Custom Text Configuration */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">2. Customize Banner Content</p>
                <div className="space-y-3 bg-black/25 p-4 rounded-xl border border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Main Heading Title</label>
                    <input
                      type="text"
                      className="bg-slate-900 border border-slate-800 rounded p-2.5 w-full text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                      value={state.lowerThird?.mainText || ""}
                      onChange={(e) => updateState(s => ({
                        ...s,
                        lowerThird: {
                          ...s.lowerThird,
                          mainText: e.target.value.toUpperCase()
                        }
                      }))}
                      placeholder="e.g. KUNJUNGI WEBSITE KAMI"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-455 uppercase tracking-widest">Subtitle Link Path / Website URL</label>
                    <input
                      type="text"
                      className="bg-slate-900 border border-slate-800 rounded p-2.5 w-full text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                      value={state.lowerThird?.subText || ""}
                      onChange={(e) => updateState(s => ({
                        ...s,
                        lowerThird: {
                          ...s.lowerThird,
                          subText: e.target.value
                        }
                      }))}
                      placeholder="e.g. WWW.NAMAWEBSITEANDA.COM"
                    />
                  </div>
                </div>
              </div>

              {/* Broadcast Trigger Actions */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-3">3. Live Broadcast Switch</p>
                  <button
                    onClick={() => {
                      updateState(s => ({
                        ...s,
                        lowerThird: {
                          ...s.lowerThird,
                          active: !s.lowerThird?.active
                        }
                      }));
                    }}
                    className={cn(
                      "w-full py-6 px-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                      state.lowerThird?.active
                        ? "bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse"
                        : "bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-700 hover:text-slate-450"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("w-3 h-3 rounded-full", state.lowerThird?.active ? "bg-green-500 animate-ping" : "bg-slate-600")} />
                      <span className="text-[11px] font-black uppercase tracking-widest font-sans">
                        {state.lowerThird?.active ? "ACTIVE ON STREAM" : "GRAPHIC IS HIDDEN"}
                      </span>
                    </div>
                    <span className="text-[8px] font-bold text-center opacity-60 uppercase tracking-widest">
                      {state.lowerThird?.active ? "Click to disable live feed" : "Click to push banner to display overlay"}
                    </span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      updateState(s => ({
                        ...s,
                        lowerThird: {
                          ...s.lowerThird,
                          active: false,
                          style: 'none'
                        }
                      }));
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 transition-all flex items-center justify-center gap-1.5"
                  >
                    Clear Overlay Graphic
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Home Team Card */}
          <div className="bento-card" style={{ backgroundColor: "#412402", width: "304.8px" }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Home Team (WKTB)</span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-dinis-gold uppercase">Q / A</span>
            </div>
            <div className={cn("space-y-4 mb-4", !isAuthenticated && "opacity-50 pointer-events-none")}>
              <input 
                value={state.home.name || ""} 
                onChange={(e) => updateState(s => ({ ...s, home: { ...s.home, name: e.target.value.toUpperCase() } }))}
                className="bg-bento-bg border border-bento-border rounded p-2 w-full text-sm font-bold focus:outline-none focus:border-wakatobi-blue-light"
                placeholder="Team Name"
                disabled={!isAuthenticated}
              />
              <ImageDropInput
                value={state.home.logo || ""}
                onChange={(url) => updateState(s => ({ ...s, home: { ...s.home, logo: url } }))}
                placeholder="Logo URL or drag / drop file"
                disabled={!isAuthenticated}
                accentColor="blue"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-5xl font-black font-condensed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{state.home.score}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateState(s => ({ ...s, home: { ...s.home, score: s.home.score + 1 } }))}
                  className="w-12 h-12 bg-slate-700 hover:bg-green-600 rounded flex items-center justify-center transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => updateState(s => ({ ...s, home: { ...s.home, score: Math.max(0, s.home.score - 1) } }))}
                  className="w-12 h-12 bg-slate-700 hover:bg-red-600 rounded flex items-center justify-center transition-all active:scale-95"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Team Fouls */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Team Fouls</div>
                <div className={cn(
                  "text-2xl font-black",
                  state.home.fouls >= 5 ? "text-red-500 animate-pulse" : "text-amber-500"
                )}>
                  {state.home.fouls}
                  {state.home.fouls >= 5 && <span className="text-[10px] ml-1 uppercase">Bonus</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateState(s => ({ ...s, home: { ...s.home, fouls: Math.min(5, s.home.fouls + 1) } }))}
                  className="w-10 h-10 bg-slate-800 hover:bg-amber-600/40 rounded flex flex-col items-center justify-center border border-slate-700 active:scale-95 transition-all text-amber-500"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[7px] font-mono mt-0.5 opacity-50">[{keybinds.homeFoulPlus.toUpperCase()}]</span>
                </button>
                <button 
                  onClick={() => updateState(s => ({ ...s, home: { ...s.home, fouls: Math.max(0, s.home.fouls - 1) } }))}
                  className="w-10 h-10 bg-slate-800 hover:bg-amber-600/40 rounded flex items-center justify-center border border-slate-700 active:scale-95 transition-all text-amber-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Match Control Center (Span 2 rows) */}
          <div className="bento-card md:row-span-2" style={{ backgroundColor: "#412402" }}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Control</span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-dinis-gold uppercase">Space / R</span>
            </div>
            
            <div className="bg-black/40 p-6 rounded-lg text-center mb-6 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.4)]">
              <div className="text-5xl font-black font-condensed text-dinis-gold tracking-tighter drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                {formatTimer(state.timer)}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">System Master Clock</div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => updateState(s => ({ ...s, timerActive: !s.timerActive }))}
                className={cn(
                  "w-full py-4 rounded-lg font-black text-lg transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(0,0,0,0.3)]",
                  state.timerActive ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/40" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40"
                )}
              >
                {state.timerActive ? "STOP CLOCK" : "START CLOCK"}
              </button>
              <button 
                onClick={() => updateState(s => ({ ...s, timer: 600, shotClock: 24, timerActive: false }))}
                className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white"
              >
                Reset 10 Min
              </button>
              <button 
                onClick={() => updateState(s => ({ ...s, home: { ...s.home, fouls: 0 }, away: { ...s.away, fouls: 0 } }))}
                className="w-full bg-amber-600 hover:bg-amber-500 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-white"
              >
                Reset Team Fouls
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Quarter Control</div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(q => (
                  <button 
                    key={q}
                    onClick={() => updateState(s => ({ ...s, quarter: q }))}
                    className={cn(
                      "p-3 rounded font-black transition-all",
                      state.quarter === q ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Shot Clock</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => updateState(s => ({ ...s, shotClock: 24 }))} className="bg-slate-800 hover:bg-amber-600/20 border border-slate-700 p-3 rounded font-bold text-amber-500 flex flex-col items-center">
                  <span>24s</span>
                  <span className="text-[8px] opacity-50 mt-1">[{keybinds.shotClock24.toUpperCase()}]</span>
                </button>
                <button onClick={() => updateState(s => ({ ...s, shotClock: 14 }))} className="bg-slate-800 hover:bg-amber-600/20 border border-slate-700 p-3 rounded font-bold text-amber-500 flex flex-col items-center">
                  <span>14s</span>
                  <span className="text-[8px] opacity-50 mt-1">[{keybinds.shotClock14.toUpperCase()}]</span>
                </button>
              </div>
            </div>
          </div>

          {/* Away Team Card */}
          <div className="bento-card" style={{ backgroundColor: "#412402" }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Away Team</span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-dinis-gold uppercase">{keybinds.awayPlus.toUpperCase()} / {keybinds.awayMinus.toUpperCase()}</span>
            </div>
            <div className={cn("space-y-4 mb-4", !isAuthenticated && "opacity-50 pointer-events-none")}>
              <input 
                value={state.away.name || ""} 
                onChange={(e) => updateState(s => ({ ...s, away: { ...s.away, name: e.target.value.toUpperCase() } }))}
                className="bg-bento-bg border border-bento-border rounded p-2 w-full text-sm font-bold focus:outline-none focus:border-wakatobi-blue-light"
                placeholder="Team Name"
                disabled={!isAuthenticated}
              />
              <ImageDropInput
                value={state.away.logo || ""}
                onChange={(url) => updateState(s => ({ ...s, away: { ...s.away, logo: url } }))}
                placeholder="Logo URL or drag / drop file"
                disabled={!isAuthenticated}
                accentColor="slate"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-5xl font-black font-condensed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{state.away.score}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateState(s => ({ ...s, away: { ...s.away, score: s.away.score + 1 } }))}
                  className="w-12 h-12 bg-slate-700 hover:bg-green-600 rounded flex items-center justify-center transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => updateState(s => ({ ...s, away: { ...s.away, score: Math.max(0, s.away.score - 1) } }))}
                  className="w-12 h-12 bg-slate-700 hover:bg-red-600 rounded flex items-center justify-center transition-all active:scale-95"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Team Fouls */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Team Fouls</div>
                <div className={cn(
                  "text-2xl font-black",
                  state.away.fouls >= 5 ? "text-red-500 animate-pulse" : "text-amber-500"
                )}>
                  {state.away.fouls}
                  {state.away.fouls >= 5 && <span className="text-[10px] ml-1 uppercase">Bonus</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateState(s => ({ ...s, away: { ...s.away, fouls: Math.min(5, s.away.fouls + 1) } }))}
                  className="w-10 h-10 bg-slate-800 hover:bg-amber-600/40 rounded flex flex-col items-center justify-center border border-slate-700 active:scale-95 transition-all text-amber-500"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[7px] font-mono mt-0.5 opacity-50">[{keybinds.awayFoulPlus.toUpperCase()}]</span>
                </button>
                <button 
                  onClick={() => updateState(s => ({ ...s, away: { ...s.away, fouls: Math.max(0, s.away.fouls - 1) } }))}
                  className="w-10 h-10 bg-slate-800 hover:bg-amber-600/40 rounded flex items-center justify-center border border-slate-700 active:scale-95 transition-all text-amber-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Branding Management - NEW SECTION */}
          <div className={cn("bento-card md:col-span-3", !isAuthenticated && "opacity-40 pointer-events-none grayscale-[1]")} style={{ backgroundColor: "#FEF0D8" }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Global Branding Slots</span>
              </div>
              {!isAuthenticated && <Lock className="w-4 h-4 text-amber-500" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Host Branding */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2">Host Slot (Left Item)</div>
                <div className="space-y-3">
                  <input 
                    value={state.branding?.hostName || ""} 
                    onChange={(e) => updateState(s => ({ ...s, branding: { ...s.branding, hostName: e.target.value.toUpperCase() } }))}
                    className="bg-bento-bg border border-bento-border rounded p-2 w-full text-xs font-bold focus:outline-none focus:border-blue-500"
                    placeholder="Host Name (e.g. KAB. WAKATOBI)"
                    style={{ backgroundColor: "#755300", borderColor: "#e8e9f4" }}
                  />
                  <ImageDropInput
                    value={state.branding?.hostLogo || ""}
                    onChange={(url) => updateState(s => ({ ...s, branding: { ...s.branding, hostLogo: url } }))}
                    placeholder="Host Logo URL or drag / drop file"
                    disabled={!isAuthenticated}
                    accentColor="blue"
                    style={{ backgroundColor: "#755300" }}
                  />
                </div>
              </div>

              {/* Owner Branding */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest border-l-2 border-amber-500 pl-2">Owner Slot (Right Item)</div>
                <div className="space-y-3">
                  <input 
                    value={state.branding?.ownerName || ""} 
                    onChange={(e) => updateState(s => ({ ...s, branding: { ...s.branding, ownerName: e.target.value.toUpperCase() } }))}
                    className="bg-bento-bg border border-bento-border rounded p-2 w-full text-xs font-bold focus:outline-none focus:border-amber-500"
                    placeholder="Owner Name (e.g. DINIS BC)"
                    style={{ backgroundColor: "#755300" }}
                  />
                  <ImageDropInput
                    value={state.branding?.ownerLogo || ""}
                    onChange={(url) => updateState(s => ({ ...s, branding: { ...s.branding, ownerLogo: url } }))}
                    placeholder="Owner Logo URL or drag / drop file"
                    disabled={!isAuthenticated}
                    accentColor="amber"
                    style={{ backgroundColor: "#755300" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sponsor Management */}
          <div className={cn("bento-card md:col-span-2", !isAuthenticated && "opacity-40 pointer-events-none grayscale-[1]")} style={{ backgroundColor: "#fff9e9" }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sponsor Management</span>
              {!isAuthenticated && <Lock className="w-3 h-3 text-amber-500" />}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Add New Sponsor</div>
                <input 
                  value={newSponsor.name}
                  onChange={e => setNewSponsor(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-bento-bg border border-bento-border rounded p-2 w-full text-xs font-bold focus:outline-none focus:border-wakatobi-blue-light"
                  placeholder="Sponsor Name"
                />
                <ImageDropInput
                  value={newSponsor.logo}
                  onChange={(url) => setNewSponsor(prev => ({ ...prev, logo: url }))}
                  placeholder="Sponsor Logo URL or drag / drop file"
                  disabled={!isAuthenticated}
                  accentColor="slate"
                />
                <input 
                  value={newSponsor.detail}
                  onChange={e => setNewSponsor(prev => ({ ...prev, detail: e.target.value }))}
                  className="bg-bento-bg border border-bento-border rounded p-2 w-full text-[10px] font-medium focus:outline-none focus:border-wakatobi-blue-light"
                  placeholder="Sponsorship Description"
                />
                <button 
                  onClick={() => {
                    if (!newSponsor.name || !newSponsor.logo) return;
                    updateState(s => ({ ...s, sponsors: [...s.sponsors, newSponsor] }));
                    setNewSponsor({ name: '', logo: '', detail: '' });
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded text-xs font-black uppercase tracking-widest transition-all"
                >
                  Add to Broadcast
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Current Sponsors</div>
                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                  <AnimatePresence>
                    {state.sponsors?.map((sp, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img src={sp.logo} className="w-8 h-8 object-contain bg-white rounded p-0.5" />
                          <div className="text-[10px] font-bold truncate max-w-[120px]">{sp.name}</div>
                        </div>
                        <button 
                          onClick={() => updateState(s => ({ ...s, sponsors: s.sponsors?.filter((_, i) => i !== idx) || [] }))}
                          className="text-red-500 hover:text-red-400 p-1"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className={cn("space-y-4", !isAuthenticated && "opacity-40 pointer-events-none grayscale-[1]")}>
             {/* Custom Keybinds Card */}
            <div className="bento-card">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Input Config</span>
                {!isAuthenticated ? <Lock className="w-3 h-3 text-amber-500" /> : <Settings2 className="w-3 h-3 text-slate-500" />}
              </div>
              <div className="space-y-1.5 overflow-y-auto max-h-[160px] pr-2">
                {(Object.entries(keybinds) as [string, string][]).map(([action, key]) => (
                  <div key={action} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1 uppercase font-bold tracking-tighter">
                    <span className="text-slate-400">{action.replace(/([A-Z])/g, ' $1')}</span>
                    <button 
                      onClick={() => setIsListening(action)}
                      className={cn(
                        "px-2 py-0.5 rounded font-mono border min-w-[24px]",
                        isListening === action ? "bg-amber-500 text-black border-amber-400 animate-pulse" : "bg-slate-900 text-white border-slate-700"
                      )}
                    >
                      {key === ' ' ? 'SPC' : key.toUpperCase()}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Broadcast Tools */}
            <div className="bento-card overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/10 rounded-bl-full -mr-8 -mt-8" />
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Production Tools</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button 
                  onClick={() => setManualState(defaultState)}
                  className="col-span-2 bg-red-600/20 text-red-500 border border-red-500/20 py-2 rounded text-[10px] font-black uppercase hover:bg-red-600/30 transition-all"
                >
                  Hard Reset System
                </button>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-white/5">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-[9px] font-bold text-slate-500">OBS SYNC ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md z-10"
            >
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => setShowLogin(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              <LoginPage onLogin={() => {
                onLogin();
                setShowLogin(false);
              }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
