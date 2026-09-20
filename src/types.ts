export type MarketStatus = 0 | 1 | 2 | 3 | 4 | 5;

export const MARKET_STATUS_MAP: Record<MarketStatus, { label: string; color: string; badge: string }> = {
  0: { label: "ACTIVE", color: "text-amber-400", badge: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  1: { label: "PENDING CONSENSUS", color: "text-cyan-400", badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" },
  2: { label: "SETTLED YES", color: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  3: { label: "SETTLED NO", color: "text-rose-400", badge: "bg-rose-500/10 border-rose-500/30 text-rose-400" },
  4: { label: "ANNULLED (REFUND)", color: "text-purple-400", badge: "bg-purple-500/10 border-purple-500/30 text-purple-400" },
  5: { label: "ABANDONED (TIMEOUT)", color: "text-slate-400", badge: "bg-slate-500/10 border-slate-500/30 text-slate-400" },
};

export interface Market {
  market_id: number;
  creator: string;
  title: string;
  criteria: string;
  primary_url: string;
  secondary_url: string;
  created_at_iso: string;
  deadline_iso: string;
  deadline_timestamp: number;
  status: MarketStatus;
  total_yes_stake: string;
  total_no_stake: string;
  total_pool_volume: string;
  total_claims_paid: string;
  remaining_payout_pool: string;
  unclaimed_winners_count: number;
  yes_stakers_count: number;
  no_stakers_count: number;
  yes_percent: number;
  no_percent: number;
  resolution_attempts: number;
  resolved_at_iso: string;
  consensus_outcome: string;
  consensus_rationale: string;
  evidence_proof_hash: string;
  evidence_proof_sample: string;
}

export interface UserStake {
  yes_stake: string;
  no_stake: string;
  claimed: boolean;
  claimable_amount: string;
}

export interface ProtocolSummary {
  version: string;
  governor: string;
  total_markets: number;
}
