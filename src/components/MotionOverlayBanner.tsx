import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface MotionOverlayBannerProps {
  active: boolean;
  styleType: "none" | "modern" | "minimalist";
  mainText: string;
  subText: string;
  scale?: number; // scaling factor for preview
}

export default function MotionOverlayBanner({
  active,
  styleType,
  mainText,
  subText,
  scale = 1,
}: MotionOverlayBannerProps) {
  if (styleType === "none" || !active) return null;

  return (
    <AnimatePresence>
      {active && (
        <div 
          className="pointer-events-none select-none z-50 flex items-center justify-center p-2 md:p-4"
          style={{ transform: `scale(${scale})`, transformOrigin: "bottom center" }}
        >
          {styleType === "modern" && (
            <ModernSportBanner mainText={mainText} subText={subText} />
          )}
          {styleType === "minimalist" && (
            <MinimalistGlassBanner mainText={mainText} subText={subText} />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

// ----------------------------------------------------------------------
// STYLE 1: MODERN SPORTS BROADCAST TICKER (AS REQUESTED IN THE IMAGE)
// - Features premium bright green, forest green, dark gray, and white layout.
// - Features staggered orange floating squares on the far left.
// - Curved and polished "HEAD TITLE" badge with customized text.
// - Right side slanted sports ribbon featuring digital swoosh + "YOUR LOGO".
// - Continuous sweeping reflective light rays and 60fps animations.
// ----------------------------------------------------------------------
function ModernSportBanner({ mainText, subText }: { mainText: string; subText: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80, transition: { duration: 0.35, ease: "easeIn" } }}
      transition={{ type: "spring", stiffness: 90, damping: 15 }}
      className="relative flex items-end h-[76px] w-[750px] max-w-full select-none overflow-visible pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
    >
      {/* 1. STAGGERED ORANGE BLOCKS (FAR LEFT) */}
      <div className="absolute left-0 bottom-3 w-12 h-14 z-35 flex items-end justify-start gap-1">
        {/* Main large orange block */}
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
          className="w-7 h-7 bg-[#FF4F02] rounded-md shadow-lg border border-white/20 shrink-0 transform translate-y-[-2px] translate-x-[4px]"
        />
        {/* Floating secondary orange block */}
        <div className="flex flex-col gap-1.5 transform translate-y-[-14px] translate-x-[-1px]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 10, delay: 0.2 }}
            className="w-3.5 h-3.5 bg-[#FF8000] rounded-sm shadow-md"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 8, delay: 0.3 }}
            className="w-2.5 h-2.5 bg-[#FFA64D] rounded-[1px] shadow-sm"
          />
        </div>
      </div>

      {/* 2. EMERALD GREEN HEAD TITLE BADGE */}
      <motion.div
        initial={{ x: -250, opacity: 0, scaleX: 0.8 }}
        animate={{ x: 0, opacity: 1, scaleX: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 16, delay: 0.15 }}
        className="relative h-14 bg-gradient-to-r from-[#008f55] to-[#00aa66] text-white z-30 shadow-[4px_0_15px_rgba(0,0,0,0.25)] flex items-center pl-11 pr-7 rounded-tr-[28px] rounded-bl-[4px] shrink-0 border-t border-r border-[#00b36b]/30"
        style={{ transformOrigin: "left center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-tr-[28px]" />
        
        {/* Scanning laser beam overlay inside badge */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", repeatDelay: 1.5 }}
          className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />

        <span className="text-white text-base md:text-[17px] font-black italic tracking-wide uppercase font-sans drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)] whitespace-nowrap">
          {mainText || "KUNJUNGI WEBSITE KAMI"}
        </span>
      </motion.div>

      {/* 3. HORIZONTAL BODY BAR CONTAINER (SLIDES OUT TO THE RIGHT) */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.25 }}
        style={{ transformOrigin: "left center" }}
        className="flex-1 h-12 flex flex-col z-20 overflow-hidden relative transform translate-x-[-12px]"
      >
        {/* UPPER BAR: Vibrant forest green */}
        <div className="h-[20px] bg-[#005c33] border-b border-white/5 flex items-center px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#004d2b] to-[#006639] pointer-events-none" />
          
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[8.5px] font-black tracking-[0.25em] text-[#9df2c3] uppercase font-sans"
          >
            BROADCAST OVERLAY STREAM • OFFICIAL MEDIA
          </motion.span>
        </div>

        {/* LOWER BAR: Sleek broadcast slate gray with high-contrast text */}
        <div className="h-[28px] bg-[#1d2022] flex items-center px-6 border-b border-[#008f55]/60 relative">
          {/* Animated elegant background grid pattern */}
          <div className="absolute inset-x-0 inset-y-0 opacity-5" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "6px 6px" }} />
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            className="flex items-center gap-1.5 w-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F02] animate-pulse" />
            <span className="text-white/95 font-bold text-xs md:text-[13px] tracking-wide font-mono uppercase truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              {subText || "WWW.DINISBC.COM"}
            </span>
          </motion.div>

          {/* Glowing sweep effect */}
          <motion.div
            animate={{ left: ["-50%", "150%"] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", repeatDelay: 2 }}
            className="absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          />
        </div>
      </motion.div>

      {/* 4. BRAND SLANTED LOGO RIBBON (FAR RIGHT) */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.35 }}
        className="relative h-12 w-32 bg-[#004424] flex flex-col justify-center items-center font-bold relative z-30 shrink-0 border-b border-[#008f55]"
        style={{
          clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0% 100%)",
          marginLeft: "-18px"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00331a] via-[#004d29] to-[#005c30] pointer-events-none" />
        
        {/* White metallic athletic swoop path animation on right */}
        <div className="flex flex-col items-center justify-center transform translate-x-[4px] scale-95 mt-0.5">
          <svg className="w-16 h-5 text-white/95 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.4)]" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {/* Elegant double swoosh loop vector similar to the image */}
            <path d="M5,25 Q50,5 95,12" strokeWidth="2" />
            <path d="M20,28 Q60,11 88,18" strokeWidth="1.5" strokeOpacity="0.8" />
          </svg>
          <span className="text-[7px] text-[#2de690] font-black uppercase tracking-[0.25em] leading-none mt-1 shadow-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
            YOUR LOGO
          </span>
        </div>

        {/* Live Broadcast micro logo marker reflection */}
        <div className="absolute right-1 top-0.5 w-1 h-1 rounded-full bg-red-500" />
      </motion.div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// STYLE 2: GLASSMORPHISM FLOATING OVERLAY (MINIMALIST & ELEGAN)
// - Features premium sleek glass with soft neon glowing borders.
// - High-quality backdrop blur filtering.
// - Soft floating interactive curves.
// ----------------------------------------------------------------------
function MinimalistGlassBanner({ mainText, subText }: { mainText: string; subText: string }) {
  return (
    <motion.div
      initial={{ y: 150, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 150, opacity: 0, transition: { duration: 0.4, ease: "easeIn" } }}
      transition={{ type: "spring", stiffness: 70, damping: 14 }}
    >
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="relative flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.3)] min-w-[440px] border-b-2 border-b-emerald-500/40"
      >
        {/* Soft pastel ambient background glow circles inside glass */}
        <div className="absolute top-0 left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-10 w-24 h-24 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
        
        {/* Minimalist Icon Block */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#008f55] to-emerald-400 flex items-center justify-center mr-4 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-300/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        {/* Text Section */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <h5 className="text-[10px] md:text-[11px] font-bold text-emerald-300 tracking-[0.2em] uppercase">
              {mainText || "SHOP NOW AT"}
            </h5>
          </div>
          <p className="text-white font-medium text-sm md:text-base tracking-tight mt-0.5 font-mono">
            {subText || "WWW.DINISBC.COM"}
          </p>
        </div>

        {/* Minimalist branding indicator */}
        <div className="text-[7.5px] uppercase tracking-[0.15em] font-black text-white/45 border-l border-white/10 pl-3 ml-3 shrink-0">
          TV STREAM<br />LIVE OVERLAY
        </div>
      </motion.div>
    </motion.div>
  );
}
