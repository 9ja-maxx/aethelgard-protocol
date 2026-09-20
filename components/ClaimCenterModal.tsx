"use client";

import React, { useState } from "react";
import { X, Coins, CheckCircle, AlertCircle, ArrowUpRight, ShieldAlert } from "lucide-react";
import { Market } from "../src/types";
import { formatGen } from "../src/utils";

interface ClaimableItem {
  market: Market;
  claimableAmount: string;
  type: "WINNINGS" | "REFUND" | "ABANDON";
}

interface ClaimCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimableItems: ClaimableItem[];
  onClaim: (marketId: number, type: "WINNINGS" | "REFUND" | "ABANDON") => Promise<void>;
  walletAddress: string | null;
}

export const ClaimCenterModal: React.FC<ClaimCenterModalProps> = ({
  isOpen,
  onClose,
  claimableItems,
  onClaim,
  walletAddress,
}) => {
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalClaimableWei = claimableItems.reduce(
    (acc, item) => acc + BigInt(item.claimableAmount || "0"),
    0n
  );

  const handleClaim = async (marketId: number, type: "WINNINGS" | "REFUND" | "ABANDON") => {
    setError(null);
    setClaimingId(marketId);
    try {
      await onClaim(marketId, type);
    } catch (err: any) {
      setError(err?.message || "Claim transaction failed");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/30 bg-obsidian-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Aethelgard Claim Clearinghouse</h2>
              <p className="text-xs text-slate-400 font-mono">
                O(1) Pull-Payment Settlement Ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Aggregate Banner */}
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-transparent p-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Total Claimable Balance
          </span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold font-mono text-cyan-300">
              {formatGen(totalClaimableWei.toString())} GEN
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({claimableItems.length} available {claimableItems.length === 1 ? "claim" : "claims"})
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center space-x-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs font-mono text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Claim Items List */}
        <div className="mt-4 max-h-72 overflow-y-auto space-y-2.5 pr-1">
          {claimableItems.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-400">
              {walletAddress ? (
                <span>No claimable winnings or refunds found for connected wallet.</span>
              ) : (
                <span>Please connect your Web3 wallet to inspect claimable balances.</span>
              )}
            </div>
          ) : (
            claimableItems.map((item) => (
              <div
                key={item.market.market_id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-obsidian-800/50 p-3.5 transition-all hover:border-slate-700"
              >
                <div className="max-w-[70%]">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                        item.type === "WINNINGS"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-purple-500/30 bg-purple-500/10 text-purple-400"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Market #{item.market.market_id}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-200 truncate">
                    {item.market.title}
                  </p>
                  <span className="mt-1 block text-xs font-mono font-bold text-cyan-400">
                    {formatGen(item.claimableAmount)} GEN
                  </span>
                </div>

                <button
                  onClick={() => handleClaim(item.market.market_id, item.type)}
                  disabled={claimingId === item.market.market_id}
                  className="flex items-center space-x-1 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-all hover:bg-cyan-500/30 hover:border-cyan-400 disabled:opacity-50"
                >
                  <span>{claimingId === item.market.market_id ? "Claiming..." : "Withdraw"}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Security Note */}
        <div className="mt-4 flex items-start space-x-2 border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-400">
          <ShieldAlert className="h-4 w-4 shrink-0 text-gold-400 mt-0.5" />
          <span>
            Pulls are executed atomically via Checks-Effects-Interactions with zero push-loop gas overhead.
          </span>
        </div>
      </div>
    </div>
  );
};
