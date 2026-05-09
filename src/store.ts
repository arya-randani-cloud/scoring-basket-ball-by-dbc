import * as React from "react";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";

export type Sponsor = {
  name: string;
  logo: string;
  detail: string;
};

export type OverlayLayout = {
  position: 'top' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  scale: number;
  showSponsors: boolean;
};

export type ScoreboardState = {
  home: { name: string; score: number; logo: string; fouls: number };
  away: { name: string; score: number; logo: string; fouls: number };
  timer: number; // in seconds
  timerActive: boolean;
  quarter: number;
  shotClock: number;
  shotClockActive: boolean;
  sponsors: Sponsor[];
  layout: OverlayLayout;
};

export const defaultState: ScoreboardState = {
  home: { name: "DINIS BC", score: 0, logo: "", fouls: 0 },
  away: { name: "AWAY TEAM", score: 0, logo: "", fouls: 0 },
  timer: 600,
  timerActive: false,
  quarter: 1,
  shotClock: 24,
  shotClockActive: false,
  sponsors: [],
  layout: {
    position: 'bottom',
    alignment: 'center',
    scale: 1,
    showSponsors: true,
  }
};

let socket: any;

export function useScoreboard() {
  const [state, setState] = React.useState<ScoreboardState>(defaultState);

  const updateState = React.useCallback((updater: (prev: ScoreboardState) => ScoreboardState) => {
    setState((prev) => {
      const newState = updater(prev);
      if (socket) socket.emit("sync", newState);
      return newState;
    });
  }, []);

  const setManualState = React.useCallback((newState: ScoreboardState) => {
    setState(newState);
    if (socket) socket.emit("sync", newState);
  }, []);

  React.useEffect(() => {
    socket = io();

    socket.on("update", (newState: ScoreboardState) => {
      setState(current => {
        // Ensure all fields exist (handle version mismatches)
        const mergedState = {
          ...defaultState,
          ...newState,
          home: { ...defaultState.home, ...newState.home },
          away: { ...defaultState.away, ...newState.away },
          sponsors: newState.sponsors || defaultState.sponsors,
          layout: { ...defaultState.layout, ...newState.layout }
        };
        
        // Deep comparison to avoid unnecessary re-renders/feedback
        if (JSON.stringify(current) === JSON.stringify(mergedState)) return current;
        return mergedState;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Timer tick logic
  React.useEffect(() => {
    let interval: any;
    if (state.timerActive && state.timer > 0) {
      let lastTime = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        
        setState(prev => {
          if (!prev.timerActive) return prev;
          const nextTimer = Math.max(0, prev.timer - delta);
          const nextShotClock = Math.max(0, prev.shotClock - delta);
          
          return {
            ...prev,
            timer: nextTimer,
            shotClock: nextShotClock,
            timerActive: nextTimer > 0
          };
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [state.timerActive]);

  return { state, updateState, setManualState };
}

export function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (m === 0 && seconds < 60) {
    return `${s.toString().padStart(2, '0')}.${ms}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
