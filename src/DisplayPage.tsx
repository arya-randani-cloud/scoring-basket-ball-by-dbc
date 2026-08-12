import * as React from "react";
import { useScoreboard, formatTimer } from "./store";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import MotionOverlayBanner from "./components/MotionOverlayBanner";

function FoulDots({ count, side }: { count: number; side: 'left' | 'right' }) {
  return (
    <div className={cn("flex gap-1 items-center mt-1", side === 'right' ? "flex-row-reverse" : "")}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i}
          className={cn(
            "w-2 h-2 rounded-[1px] transition-colors duration-300",
            i <= count 
              ? (count >= 5 ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "bg-amber-400") 
              : "bg-white/10"
          )}
        />
      ))}
      {count >= 5 && (
        <span className={cn(
          "text-[8px] font-black text-red-500 animate-pulse uppercase tracking-tighter",
          side === 'left' ? "ml-1" : "mr-1"
        )}>
          Bonus
        </span>
      )}
    </div>
  );
}

export default function DisplayPage() {
  const { state } = useScoreboard();
  const [activeSponsor, setActiveSponsor] = React.useState(0);
  
  const layout = state.layout || {
    position: 'bottom',
    alignment: 'center',
    scale: 1,
    showSponsors: true,
  };

  React.useEffect(() => {
    if ((state.sponsors?.length || 0) === 0) return;
    const interval = setInterval(() => {
      setActiveSponsor((prev) => (prev + 1) % (state.sponsors?.length || 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [state.sponsors?.length]);

  const alignmentClasses = {
    left: "items-start",
    center: "items-center",
    right: "items-end"
  };

  const originClasses = {
    left: layout.position === 'top' ? "origin-top-left" : "origin-bottom-left",
    center: layout.position === 'top' ? "origin-top" : "origin-bottom",
    right: layout.position === 'top' ? "origin-top-right" : "origin-bottom-right"
  };

  return (
    <div 
      className={cn(
        "h-screen w-screen overflow-hidden flex flex-col p-[4%] transition-all duration-700 relative",
        layout.position === 'top' ? "justify-start" : "justify-end",
        alignmentClasses[layout.alignment]
      )}
      style={{ backgroundColor: layout.chromaKey ? "#00ff00" : "transparent" }}
    >
      <motion.div 
        layout
        style={{ scale: layout.scale }}
        className={cn("flex flex-col transition-all duration-500 shadow-2xl", originClasses[layout.alignment], alignmentClasses[layout.alignment])}
      >
        <motion.div 
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex h-24 relative bg-slate-900 rounded-t overflow-hidden shadow-2xl"
        >
          {/* Regional Logo Left (WKTB) */}
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
            
            {/* Home Stats */}
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

            {/* Central Info (Time & Period) */}
            <div className="flex-1 flex flex-col items-center justify-center border-x border-white/5 h-full px-6 bg-black/20">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-mono font-bold text-amber-500 bg-black/60 px-4 py-1 rounded border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] tabular-nums leading-none">
                  {formatTimer(state.timer)}
                </div>
                <div className={cn(
                  "text-2xl font-mono font-bold px-3 py-0.5 mt-1 rounded border tabular-nums transition-colors",
                  state.shotClock <= 5 ? "text-red-500 bg-red-950/40 border-red-500/50" : "text-amber-500 bg-black/40 border-white/5"
                )}>
                  {Math.ceil(state.shotClock)}
                </div>
              </div>
              <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">PERIOD {state.quarter}</div>
              
              {/* Foul Dots Dashboard */}
              <div className="flex gap-4 mt-2">
                 <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={cn("w-2 h-2 rounded-sm transition-colors", i < state.home.fouls ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-white/10")} />
                    ))}
                 </div>
                 <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={cn("w-2 h-2 rounded-sm transition-colors", i < state.away.fouls ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-white/10")} />
                    ))}
                 </div>
              </div>
            </div>

            {/* Away Stats */}
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
          <div className="w-24 bg-gradient-to-bl from-white via-white to-amber-50 flex flex-col items-center justify-center p-2 z-10 shrink-0 relative border-l border-black/10 shadow-[-5px_0_15px_-5px_rgba(245,158,11,0.2)]">
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
        </motion.div>

        {/* Sponsor Banner (Tightly Integrated) */}
        <AnimatePresence>
          {layout.showSponsors && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 32, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-black flex items-center justify-center gap-12 overflow-hidden border-x border-b border-white/10 rounded-b shadow-2xl px-8"
            >
               <div className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em] shrink-0">SUPPORTED BY:</div>
               <div className="flex items-center gap-10">
                 <AnimatePresence mode="wait">
                   {(state.sponsors?.length || 0) > 0 && (
                     <motion.div
                       key={activeSponsor}
                       initial={{ y: 10, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       exit={{ y: -10, opacity: 0 }}
                       className="flex items-center gap-3 text-white"
                     >
                        <img src={state.sponsors[activeSponsor]?.logo} alt="" className="h-4 w-auto object-contain brightness-125" />
                        <span className="font-extrabold italic text-[10px] tracking-wider text-white/90">{state.sponsors[activeSponsor]?.name}</span>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
               <div className="text-white/20 text-[8px] font-bold px-4 border-l border-white/10 uppercase tracking-widest shrink-0">Wakatobi Basketball Championship</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Broadcast Lower Third Motion Overlays */}
      <div className={cn(
        "absolute inset-x-0 flex justify-center pointer-events-none z-50 transition-all duration-500",
        layout.position === 'bottom' ? "top-[8%]" : "bottom-[8%]"
      )}>
        <MotionOverlayBanner
          active={!!state.lowerThird?.active}
          styleType={state.lowerThird?.style || "none"}
          mainText={state.lowerThird?.mainText || ""}
          subText={state.lowerThird?.subText || ""}
        />
      </div>
    </div>
  );
}
