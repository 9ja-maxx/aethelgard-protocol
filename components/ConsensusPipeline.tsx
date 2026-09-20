"use client";

import React from "react";
import { Globe, Filter, BrainCircuit, ShieldCheck, ArrowRight } from "lucide-react";

export const ConsensusPipeline: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Live-Web Ingestion",
      desc: "Independent validators execute gl.nondet.web.get against trusted institutional sources.",
      icon: Globe,
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
    },
    {
      step: "02",
      title: "In-Contract Cleansing",
      desc: "Contract-side regex strips scripts, styles, and chrome to prevent prompt injection and token overflow.",
      icon: Filter,
      color: "text-cyan-400",
      border: "border-cyan-500/20",
      bg: "bg-cyan-500/10",
    },
    {
      step: "03",
      title: "Hardened Deliberation",
      desc: "Validators execute isolated gl.nondet.exec_prompt against strict 4-band resolution criteria.",
      icon: BrainCircuit,
      color: "text-gold-400",
      border: "border-gold-500/20",
      bg: "bg-gold-500/10",
    },
    {
      step: "04",
      title: "Equivalence Finality",
      desc: "gl.eq_principle.prompt_comparative asserts exact categorical outcome agreement before clearing claims.",
      icon: ShieldCheck,
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="mb-10 rounded-2xl border border-gold-500/15 bg-obsidian-900/60 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-gold-400 font-bold">
            Consensus Mechanics
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            The Aethelgard Autonomous Settlement Pipeline
          </h2>
        </div>
        <span className="hidden sm:block text-xs font-mono text-slate-400">
          Decentralized & Multi-Validator Verified
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className={`relative rounded-xl border ${s.border} bg-obsidian-800/40 p-4 transition-all hover:bg-obsidian-800/70`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`rounded-lg p-2 ${s.bg} ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {s.step}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
