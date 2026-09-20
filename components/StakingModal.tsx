"use client";

import React, { useState } from "react";
import { X, TrendingUp, AlertCircle, Coins, Check } from "lucide-react";
import { Market } from "../src/types";
import { formatGen, calculateProjectedPayout } from "../src/utils";

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
  initialSide: "YES" | "NO";
  onConfirmStake: (marketId: number, side: "YES" | "NO", amountGen: string) => Promise<void>;
}

export const StakingModal: React.FC<StakingModalProps> = ({
  isOpen,
  onClose,
  market,
  initialSide,
  onConfirmStake,
}) => {
  const [side, setSide] = useState<"YES" | "NO">(initialSide);
  const [amount, setAmount] = useState<string>("1.0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !market) return null;

  const currentYes = parseFloat(formatGen(market.total_yes_stake).replace(/,/g, "")) || 0;
  const currentNo = parseFloat(formatGen(market.total_no_stake).replace(/,/g, "")) || 0;
  const stakeNum = parseFloat(amount) || 0;

  const { projectedReturn, multiplier } = calculateProjectedPayout(stakeNum, side, currentYes, currentNo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stakeNum <= 0) {
      setError("Please enter a stake amount greater than 0");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirmStake(market.market_id, side, amount);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Staking transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold-500/20 bg-obsidian-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-gold-400" />
            <h2 className="text-lg font-bold text-white">Deposit Parimutuel Stake</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Market Title */}
        <p className="mt-3 text-xs text-slate-300 line-clamp-2">
          {market.title}
        </p>

        {/* Staking Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Side Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Select Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide("YES")}
                className={`flex items-center justify-center space-x-1.5 rounded-lg border py-2.5 text-xs font-bold transition-all ${
                  side === "YES"
                    ? "border-gold-400 bg-gold-500/20 text-gold-300 shadow-gold-glow"
                    : "border-slate-800 bg-obsidian-800/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                {side === "YES" && <Check className="h-4 w-4" />}
                <span>STAKE YES</span>
              </button>
              <button
                type="button"
                onClick={() => setSide("NO")}
                className={`flex items-center justify-center space-x-1.5 rounded-lg border py-2.5 text-xs font-bold transition-all ${
                  side === "NO"
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-cyan-glow"
                    : "border-slate-800 bg-obsidian-800/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                {side === "NO" && <Check className="h-4 w-4" />}
                <span>STAKE NO</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">
                Deposit Amount (GEN)
              </label>
              <span className="text-[11px] font-mono text-slate-400">Min: 0.001 GEN</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-obsidian-800/90 px-3.5 py-2.5 font-mono text-sm text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-mono text-gold-400 font-bold">
                GEN
              </span>
            </div>
          </div>

          {/* Real-time Projected Return Card */}
          <div className="rounded-xl border border-slate-800 bg-obsidian-800/40 p-3.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center space-x-1">
                <TrendingUp className="h-3.5 w-3.5 text-gold-400" />
                <span>Projected Return</span>
              </span>
              <span className="font-bold text-white">
                ~{projectedReturn.toFixed(4)} GEN
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Implied Multiplier</span>
              <span className="font-bold text-gold-400">
                {multiplier.toFixed(2)}x
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs font-mono text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gold-500/40 bg-gradient-to-r from-gold-500 to-amber-500 py-2.5 text-xs font-bold uppercase tracking-wider text-obsidian-950 transition-all hover:from-gold-400 hover:to-amber-400 disabled:opacity-50 shadow-gold-glow"
          >
            {isSubmitting ? "Confirming Deposit..." : `Deposit ${amount} GEN on ${side}`}
          </button>
        </form>
      </div>
    </div>
  );
};
