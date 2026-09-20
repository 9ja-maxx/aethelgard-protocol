"use client";

import React from "react";
import { ExternalLink, Clock, Users, ArrowRight, ShieldCheck, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Market, MARKET_STATUS_MAP } from "../src/types";
import { formatGen, formatTimeRemaining, truncateAddress } from "../src/utils";

interface MarketCardProps {
  market: Market;
  onOpenStake: (market: Market, side: "YES" | "NO") => void;
  onOpenProof: (market: Market) => void;
  onResolve: (marketId: number) => void;
  onClaim: (marketId: number) => void;
  userClaimable: string;
  isResolving: boolean;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  onOpenStake,
  onOpenProof,
  onResolve,
  onClaim,
  userClaimable,
  isResolving,
}) => {
  const statusInfo = MARKET_STATUS_MAP[market.status] || MARKET_STATUS_MAP[0];
  const timeRemaining = formatTimeRemaining(market.deadline_iso);
  const hasClaimable = userClaimable && BigInt(userClaimable) > 0n;

  // Extract host for clean badge
  let sourceDomain = "institutional source";
  try {
    const u = new URL(market.primary_url);
    sourceDomain = u.hostname;
  } catch {}

  return (
    <div className="glass-panel glass-panel-hover flex flex-col justify-between rounded-xl p-5 text-slate-100">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-mono font-medium ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>

          <a
            href={market.primary_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs font-mono text-slate-400 hover:text-gold-400 transition-colors"
          >
            <span>{sourceDomain}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold leading-snug text-white line-clamp-2 hover:text-gold-300 transition-colors">
          {market.title}
        </h3>

        {/* Criteria Snippet */}
        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {market.criteria}
        </p>

        {/* Parimutuel Probability Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="font-semibold text-gold-400">YES {market.yes_percent}%</span>
            <span className="font-semibold text-cyan-400">NO {market.no_percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-amber-400 transition-all duration-500"
              style={{ width: `${market.yes_percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{formatGen(market.total_yes_stake)} GEN ({market.yes_stakers_count} stakers)</span>
            <span>{formatGen(market.total_no_stake)} GEN ({market.no_stakers_count} stakers)</span>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className={timeRemaining.isExpired ? "text-rose-400" : "text-slate-300"}>
              {timeRemaining.text}
            </span>
          </div>
          <div>
            <span>Pool: </span>
            <span className="font-semibold text-slate-200">{formatGen(market.total_pool_volume)} GEN</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 border-t border-slate-800/80 pt-4">
        {/* User Claim Alert if eligible */}
        {hasClaimable && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-mono">
            <div className="flex items-center space-x-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>Claimable: {formatGen(userClaimable)} GEN</span>
            </div>
            <button
              onClick={() => onClaim(market.market_id)}
              className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-bold text-obsidian-950 transition-colors hover:bg-emerald-400"
            >
              Claim Now
            </button>
          </div>
        )}

        {/* Dynamic Buttons based on status */}
        {market.status === 0 && !timeRemaining.isExpired && (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onOpenStake(market, "YES")}
              className="flex items-center justify-center space-x-1.5 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs font-semibold text-gold-300 transition-all hover:bg-gold-500/20 hover:border-gold-400"
            >
              <span>Stake YES</span>
              <ArrowRight className="h-3.5 w-3.5 text-gold-400" />
            </button>
            <button
              onClick={() => onOpenStake(market, "NO")}
              className="flex items-center justify-center space-x-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 hover:border-cyan-400"
            >
              <span>Stake NO</span>
              <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
            </button>
          </div>
        )}

        {(market.status === 1 || (market.status === 0 && timeRemaining.isExpired)) && (
          <button
            onClick={() => onResolve(market.market_id)}
            disabled={isResolving}
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-600/30 to-cyan-500/30 px-4 py-2 text-xs font-semibold text-cyan-200 transition-all hover:border-cyan-400 hover:from-cyan-600/40 hover:to-cyan-500/40 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>{isResolving ? "Resolving via Consensus..." : "Trigger Autonomous Consensus"}</span>
          </button>
        )}

        {(market.status === 2 || market.status === 3 || market.status === 4 || market.status === 5) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Outcome:</span>
              <span className={`text-xs font-mono font-bold ${statusInfo.color}`}>
                {market.consensus_outcome || statusInfo.label}
              </span>
            </div>
            <button
              onClick={() => onOpenProof(market)}
              className="flex items-center space-x-1 rounded-md border border-slate-700 bg-obsidian-700/60 px-2.5 py-1 text-xs font-mono text-slate-300 hover:border-slate-500 hover:text-white transition-all"
            >
              <FileText className="h-3 w-3 text-gold-400" />
              <span>View Proof</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
