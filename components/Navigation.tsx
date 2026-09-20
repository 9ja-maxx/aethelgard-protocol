"use client";

import React from "react";
import { Shield, Sparkles, Wallet, PlusCircle, Coins } from "lucide-react";
import { truncateAddress } from "../src/utils";

interface NavigationProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  onOpenCreateModal: () => void;
  onOpenClaimModal: () => void;
  claimableCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  walletAddress,
  onConnectWallet,
  onOpenCreateModal,
  onOpenClaimModal,
  claimableCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gold-500/15 bg-obsidian-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500/20 via-gold-500/10 to-transparent border border-gold-500/30 text-gold-400 shadow-gold-glow">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-slate-100">
                AETHELGARD
              </span>
              <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400">
                Matrix
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              Autonomous Live-Web Consensus & Clearinghouse
            </p>
          </div>
        </div>

        {/* Action Controls & Wallet */}
        <div className="flex items-center space-x-3">
          {/* Network Indicator */}
          <div className="hidden items-center space-x-2 rounded-lg border border-slate-800 bg-obsidian-800/60 px-2.5 py-1 text-xs font-mono text-slate-300 md:flex">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>StudioNet (61999)</span>
          </div>

          {/* Claim Center Button */}
          <button
            onClick={onOpenClaimModal}
            className="relative flex items-center space-x-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-500/20 hover:border-cyan-400/50"
          >
            <Coins className="h-3.5 w-3.5 text-cyan-400" />
            <span>Claim Center</span>
            {claimableCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-obsidian-950">
                {claimableCount}
              </span>
            )}
          </button>

          {/* Create Market Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 rounded-lg border border-gold-500/40 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-3 py-1.5 text-xs font-medium text-gold-300 transition-all hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30 shadow-gold-glow"
          >
            <PlusCircle className="h-3.5 w-3.5 text-gold-400" />
            <span>New Market</span>
          </button>

          {/* Connect Wallet */}
          <button
            onClick={onConnectWallet}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-obsidian-700/80 px-3.5 py-1.5 text-xs font-mono font-medium text-slate-200 transition-all hover:border-slate-500 hover:bg-obsidian-600/80"
          >
            <Wallet className="h-3.5 w-3.5 text-gold-400" />
            <span>{walletAddress ? truncateAddress(walletAddress) : "Connect Wallet"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
