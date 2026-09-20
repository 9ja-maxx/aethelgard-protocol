"use client";

import React, { useState } from "react";
import { Calculator, TrendingUp, Sparkles } from "lucide-react";
import { calculateProjectedPayout } from "../src/utils";

interface OddsSimulatorProps {
  initialYesGen?: number;
  initialNoGen?: number;
}

export const OddsSimulator: React.FC<OddsSimulatorProps> = ({
  initialYesGen = 10,
  initialNoGen = 10,
}) => {
  const [stakeAmount, setStakeAmount] = useState<number>(2.5);
  const [side, setSide] = useState<"YES" | "NO">("YES");

  const { projectedReturn, multiplier } = calculateProjectedPayout(
    stakeAmount,
    side,
    initialYesGen,
    initialNoGen
  );

  return (
    <div className="rounded-xl border border-gold-500/20 bg-obsidian-900/90 p-4 font-mono text-xs text-slate-200">
      <div className="flex items-center space-x-2 text-gold-400 font-bold mb-3">
        <Calculator className="h-4 w-4" />
        <span>PARIMUTUEL ODDS CALCULATOR</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] uppercase text-slate-500 block mb-1">Position</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setSide("YES")}
              className={`rounded py-1 text-center font-bold ${
                side === "YES" ? "bg-gold-500 text-black" : "bg-slate-800 text-slate-400"
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setSide("NO")}
              className={`rounded py-1 text-center font-bold ${
                side === "NO" ? "bg-cyan-500 text-black" : "bg-slate-800 text-slate-400"
              }`}
            >
              NO
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase text-slate-500 block mb-1">Simulated Stake (GEN)</label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
            className="w-full rounded bg-slate-800 px-2 py-1 text-right text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-slate-400">
        <span>Est. Payout:</span>
        <span className="font-bold text-emerald-400">{projectedReturn.toFixed(3)} GEN ({multiplier.toFixed(2)}x)</span>
      </div>
    </div>
  );
};
