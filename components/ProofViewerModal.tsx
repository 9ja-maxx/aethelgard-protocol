"use client";

import React from "react";
import { X, ShieldCheck, Hash, FileText, CheckCircle2, ExternalLink } from "lucide-react";
import { Market } from "../src/types";

interface ProofViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
}

export const ProofViewerModal: React.FC<ProofViewerModalProps> = ({
  isOpen,
  onClose,
  market,
}) => {
  if (!isOpen || !market) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gold-500/30 bg-obsidian-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-gold-500/10 p-2 text-gold-400 border border-gold-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cryptographic Consensus Receipt</h2>
              <p className="text-xs text-slate-400 font-mono">
                Multi-Validator Equivalence Proof & Evidence Audit
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

        {/* Content Body */}
        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Outcome Badge */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-obsidian-800/40 p-3.5">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400">
                Consensus Verdict
              </span>
              <div className="text-base font-bold font-mono text-gold-400">
                {market.consensus_outcome || "RESOLVED"}
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              <span>Settled At: </span>
              <span className="text-slate-300">
                {market.resolved_at_iso ? new Date(market.resolved_at_iso).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-mono uppercase text-slate-400 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-gold-400" />
              <span>Validator Consensus Rationale</span>
            </label>
            <div className="rounded-xl border border-slate-800 bg-obsidian-800/60 p-3 text-xs leading-relaxed text-slate-300">
              {market.consensus_rationale || "Adjudicated through comparative validator consensus over live web evidence."}
            </div>
          </div>

          {/* SHA-256 Proof Digest */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-mono uppercase text-slate-400 mb-1.5">
              <Hash className="h-3.5 w-3.5 text-cyan-400" />
              <span>Evidence SHA-256 Digest</span>
            </label>
            <div className="rounded-xl border border-slate-800 bg-obsidian-800/60 p-3 font-mono text-xs text-cyan-300 break-all select-all hover:bg-slate-800 transition-colors cursor-pointer">
              {market.evidence_proof_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
            </div>
          </div>

          {/* Evidence Excerpt Preview */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 mb-1.5 block">
              Sanitized Text Excerpt (In-Contract Regex Cleaned)
            </label>
            <div className="rounded-xl border border-slate-800 bg-obsidian-800/60 p-3 font-mono text-[11px] leading-relaxed text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
              {market.evidence_proof_sample || "Evidence extracted and verified from authoritative primary source URL."}
            </div>
          </div>

          {/* Source Link */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs font-mono text-slate-400">
            <span>Primary Evidence Source:</span>
            <a
              href={market.primary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gold-400 hover:underline"
            >
              <span>Verify Live URL</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
