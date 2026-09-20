"use client";

import React, { useState } from "react";
import { X, PlusCircle, AlertCircle, CheckCircle2, Globe, Shield } from "lucide-react";

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMarket: (
    title: string,
    criteria: string,
    deadlineIso: string,
    primaryUrl: string,
    secondaryUrl: string
  ) => Promise<void>;
}

const TRUSTED_DOMAINS_SAMPLE = [
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "sec.gov",
  "nasa.gov",
  "noaa.gov",
  "who.int",
  "nature.com",
  "en.wikipedia.org",
];

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({
  isOpen,
  onClose,
  onCreateMarket,
}) => {
  const [title, setTitle] = useState("");
  const [criteria, setCriteria] = useState("");
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [secondaryUrl, setSecondaryUrl] = useState("");
  const [days, setDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time domain validation check
  const isDomainApproved = (url: string) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return TRUSTED_DOMAINS_SAMPLE.some((d) => host === d || host.endsWith("." + d));
    } catch {
      return false;
    }
  };

  const domainStatus = isDomainApproved(primaryUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 10 || title.trim().length > 200) {
      setError("Market question must be between 10 and 200 characters.");
      return;
    }
    if (criteria.trim().length < 20 || criteria.trim().length > 1000) {
      setError("Resolution criteria must be between 20 and 1000 characters.");
      return;
    }
    if (!primaryUrl.startsWith("http://") && !primaryUrl.startsWith("https://")) {
      setError("Primary URL must start with http:// or https://");
      return;
    }
    if (domainStatus === false) {
      setError("Primary source host is not in the approved trusted domain registry.");
      return;
    }

    const durationDays = parseFloat(days) || 30;
    const deadlineIso = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();

    setIsSubmitting(true);
    try {
      await onCreateMarket(title.trim(), criteria.trim(), deadlineIso, primaryUrl.trim(), secondaryUrl.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create market");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gold-500/20 bg-obsidian-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-gold-400" />
            <h2 className="text-lg font-bold text-white">Create Prediction Market</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Market Question (10-200 chars)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Will the regulatory bill pass by December 2026?"
              required
              className="w-full rounded-lg border border-slate-700 bg-obsidian-800/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
          </div>

          {/* Criteria */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Resolution Criteria (20-1000 chars)
            </label>
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="Explicit, unambiguous conditions. e.g. Resolves YES if Reuters publishes an official confirmation of passage before the cutoff date. Resolves NO otherwise."
              required
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-obsidian-800/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
          </div>

          {/* Primary URL */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">
                Primary Authoritative Source URL
              </label>
              {domainStatus === true && (
                <span className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approved Domain</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="url"
                value={primaryUrl}
                onChange={(e) => setPrimaryUrl(e.target.value)}
                placeholder="https://www.reuters.com/world/article-id"
                required
                className="w-full rounded-lg border border-slate-700 bg-obsidian-800/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 font-mono"
              />
            </div>
            <span className="mt-1 block text-[11px] font-mono text-slate-400">
              Approved: Reuters, BBC, AP News, SEC, NOAA, NASA, Nature, Wikipedia, etc.
            </span>
          </div>

          {/* Secondary URL (Optional) */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Secondary Corroborating URL (Optional)
            </label>
            <input
              type="url"
              value={secondaryUrl}
              onChange={(e) => setSecondaryUrl(e.target.value)}
              placeholder="https://en.wikipedia.org/wiki/Topic"
              className="w-full rounded-lg border border-slate-700 bg-obsidian-800/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 font-mono"
            />
          </div>

          {/* Staking Duration */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Staking Cutoff Horizon
            </label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-obsidian-800/90 px-3.5 py-2.5 text-xs text-white focus:border-gold-400 focus:outline-none font-mono"
            >
              <option value="1">1 Day (Fast Adjudication)</option>
              <option value="7">7 Days (1 Week)</option>
              <option value="30">30 Days (1 Month)</option>
              <option value="90">90 Days (1 Quarter)</option>
              <option value="180">180 Days (Half Year)</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center space-x-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs font-mono text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gold-500/40 bg-gradient-to-r from-gold-500 to-amber-500 py-2.5 text-xs font-bold uppercase tracking-wider text-obsidian-950 transition-all hover:from-gold-400 hover:to-amber-400 disabled:opacity-50 shadow-gold-glow"
          >
            {isSubmitting ? "Creating On-Chain Market..." : "Initialize Prediction Market"}
          </button>
        </form>
      </div>
    </div>
  );
};
