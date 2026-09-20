"use client";

import React from "react";
import { Globe, Scale, Lock, Zap } from "lucide-react";
import { formatGen } from "../src/utils";

interface HeroBannerProps {
  totalVolume: string;
  marketCount: number;
  totalClaimsPaid: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalVolume,
  marketCount,
  totalClaimsPaid,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold-500/15 bg-gradient-to-b from-obsidian-800/80 to-obsidian-900/80 p-6 sm:p-8 backdrop-blur-xl mb-8">
      {/* Subtle Background Radial Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-mono text-gold-400 mb-4">
          <Zap className="h-3 w-3" />
          <span>Equivalence Principle Consensus Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Verifiable Truth Settled by{" "}
          <span className="bg-gradient-to-r from-gold-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
            Autonomous Web Consensus
          </span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          Aethelgard eliminates centralized oracles, subjective dispute councils, and vulnerable off-chain feeds.
          Decentralized GenLayer validators directly retrieve primary institutional source documents, sanitize
          live markup contract-side, and clear parimutuel claims with mathematically proven solvency.
        </p>

        {/* Live Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Escrow</span>
            <span className="mt-1 text-xl font-bold font-mono text-gold-400">{formatGen(totalVolume)} GEN</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Markets</span>
            <span className="mt-1 text-xl font-bold font-mono text-white">{marketCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Claims Cleared</span>
            <span className="mt-1 text-xl font-bold font-mono text-cyan-400">{formatGen(totalClaimsPaid)} GEN</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Solvency Invariant</span>
            <span className="mt-1 text-xl font-bold font-mono text-emerald-400">100% Strict</span>
          </div>
        </div>
      </div>
    </div>
  );
};
