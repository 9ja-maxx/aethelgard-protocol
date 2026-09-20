"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { HeroBanner } from "../components/HeroBanner";
import { MarketCard } from "../components/MarketCard";
import { StakingModal } from "../components/StakingModal";
import { ClaimCenterModal } from "../components/ClaimCenterModal";
import { ProofViewerModal } from "../components/ProofViewerModal";
import { CreateMarketModal } from "../components/CreateMarketModal";
import { ConsensusPipeline } from "../components/ConsensusPipeline";
import { Market, UserStake } from "../src/types";
import {
  fetchMarketCount,
  fetchMarket,
  fetchUserStake,
  stakeYes,
  stakeNo,
  resolveMarket,
  claimPayout,
  claimRefund,
  claimStaleRefund,
  createMarket,
  getGenLayerClient,
  CONTRACT_ADDRESS,
} from "../src/contract";
import { Search, Filter, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userStakes, setUserStakes] = useState<Record<number, UserStake>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal States
  const [selectedMarketForStake, setSelectedMarketForStake] = useState<Market | null>(null);
  const [stakeSide, setStakeSide] = useState<"YES" | "NO">("YES");
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  const [selectedMarketForProof, setSelectedMarketForProof] = useState<Market | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [resolvingMarketId, setResolvingMarketId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Initialize and load markets
  const loadMarkets = async () => {
    setIsRefreshing(true);
    try {
      const client = getGenLayerClient();
      const count = await fetchMarketCount(client);
      const loadedMarkets: Market[] = [];

      for (let i = 0; i < count; i++) {
        const m = await fetchMarket(client, i);
        if (m) loadedMarkets.push(m);
      }

      setMarkets(loadedMarkets);

      // If wallet is connected, load user stakes
      if (walletAddress) {
        const stakes: Record<number, UserStake> = {};
        for (const m of loadedMarkets) {
          const s = await fetchUserStake(client, m.market_id, walletAddress);
          if (s) stakes[m.market_id] = s;
        }
        setUserStakes(stakes);
      }
    } catch (err) {
      console.error("Failed to load markets:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarkets();
  }, [walletAddress]);

  const handleConnectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
        }
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      // Mock demo wallet for testing
      setWalletAddress("0x71C8A53B9d40C922572b918B99158c54157d69Ef");
      setNotification({
        message: "Connected demo StudioNet account (0x71C8...69Ef)",
        type: "success",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Actions
  const handleOpenStake = (market: Market, side: "YES" | "NO") => {
    setSelectedMarketForStake(market);
    setStakeSide(side);
    setIsStakeModalOpen(true);
  };

  const handleConfirmStake = async (marketId: number, side: "YES" | "NO", amountGen: string) => {
    const client = getGenLayerClient();
    if (side === "YES") {
      await stakeYes(client, marketId, amountGen);
    } else {
      await stakeNo(client, marketId, amountGen);
    }
    setNotification({
      message: `Successfully staked ${amountGen} GEN on ${side}!`,
      type: "success",
    });
    setTimeout(() => setNotification(null), 4000);
    loadMarkets();
  };

  const handleOpenProof = (market: Market) => {
    setSelectedMarketForProof(market);
    setIsProofModalOpen(true);
  };

  const handleResolveMarket = async (marketId: number) => {
    setResolvingMarketId(marketId);
    try {
      const client = getGenLayerClient();
      await resolveMarket(client, marketId);
      setNotification({
        message: `Consensus resolved for market #${marketId}!`,
        type: "success",
      });
      loadMarkets();
    } catch (err: any) {
      setNotification({
        message: err?.message || "Consensus resolution failed",
        type: "error",
      });
    } finally {
      setResolvingMarketId(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleClaim = async (marketId: number, type: "WINNINGS" | "REFUND" | "ABANDON") => {
    const client = getGenLayerClient();
    if (type === "WINNINGS") {
      await claimPayout(client, marketId);
    } else if (type === "REFUND") {
      await claimRefund(client, marketId);
    } else {
      await claimStaleRefund(client, marketId);
    }
    setNotification({
      message: `Successfully claimed settlement payout!`,
      type: "success",
    });
    setTimeout(() => setNotification(null), 4000);
    loadMarkets();
  };

  const handleCreateMarket = async (
    title: string,
    criteria: string,
    deadlineIso: string,
    primaryUrl: string,
    secondaryUrl: string
  ) => {
    const client = getGenLayerClient();
    await createMarket(client, title, criteria, deadlineIso, primaryUrl, secondaryUrl);
    setNotification({
      message: "New prediction market initialized on-chain!",
      type: "success",
    });
    setTimeout(() => setNotification(null), 4000);
    loadMarkets();
  };

  // Compute protocol metrics
  const totalVolumeWei = markets.reduce(
    (acc, m) => acc + BigInt(m.total_pool_volume || "0"),
    0n
  );
  const totalClaimsPaidWei = markets.reduce(
    (acc, m) => acc + BigInt(m.total_claims_paid || "0"),
    0n
  );

  // Compute claimable items for claim center
  const claimableItems = markets
    .filter((m) => {
      const s = userStakes[m.market_id];
      return s && !s.claimed && BigInt(s.claimable_amount || "0") > 0n;
    })
    .map((m) => {
      const s = userStakes[m.market_id];
      let type: "WINNINGS" | "REFUND" | "ABANDON" = "WINNINGS";
      if (m.status === 4) type = "REFUND";
      else if (m.status === 5) type = "ABANDON";
      return {
        market: m,
        claimableAmount: s.claimable_amount,
        type,
      };
    });

  // Filter markets
  const filteredMarkets = markets.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.criteria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.primary_url.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "ACTIVE") return m.status === 0;
    if (statusFilter === "PENDING") return m.status === 1;
    if (statusFilter === "SETTLED") return m.status >= 2;
    return true;
  });

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between">
      <div>
        {/* Navigation */}
        <Navigation
          walletAddress={walletAddress}
          onConnectWallet={handleConnectWallet}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenClaimModal={() => setIsClaimModalOpen(true)}
          claimableCount={claimableItems.length}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl border border-gold-500/40 bg-obsidian-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-gold-400" />
            <span className="text-xs font-mono text-slate-200">{notification.message}</span>
          </div>
        )}

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Hero Banner */}
          <HeroBanner
            totalVolume={totalVolumeWei.toString()}
            marketCount={markets.length}
            totalClaimsPaid={totalClaimsPaidWei.toString()}
          />

          {/* Consensus Pipeline Showcase */}
          <ConsensusPipeline />

          {/* Filtering & Search Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-obsidian-900/80 p-1 font-mono text-xs">
              {["ALL", "ACTIVE", "PENDING", "SETTLED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                    statusFilter === f
                      ? "bg-gold-500/20 text-gold-400 border border-gold-500/30 shadow-gold-glow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search Input & Refresh */}
            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter markets or sources..."
                  className="w-full rounded-xl border border-slate-800 bg-obsidian-900/80 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <button
                onClick={loadMarkets}
                disabled={isRefreshing}
                className="rounded-xl border border-slate-800 bg-obsidian-900/80 p-2 text-slate-400 hover:text-gold-400 transition-colors disabled:opacity-50"
                title="Refresh on-chain state"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-gold-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Markets Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gold-400 mb-3" />
              <p className="text-sm font-mono text-slate-400">Loading Aethelgard on-chain markets...</p>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/80 bg-obsidian-900/40 py-16 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-500 mb-2" />
              <h3 className="text-base font-semibold text-slate-300">No Markets Match Filter</h3>
              <p className="mt-1 text-xs text-slate-500 font-mono">
                Try refining your query or create a new prediction market above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredMarkets.map((m) => (
                <MarketCard
                  key={m.market_id}
                  market={m}
                  onOpenStake={handleOpenStake}
                  onOpenProof={handleOpenProof}
                  onResolve={handleResolveMarket}
                  onClaim={(mId) => handleClaim(mId, "WINNINGS")}
                  userClaimable={userStakes[m.market_id]?.claimable_amount || "0"}
                  isResolving={resolvingMarketId === m.market_id}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-obsidian-900/40 py-6 text-center text-xs font-mono text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aethelgard Protocol v1.0.0 — GenLayer Intelligent Contract Matrix</span>
          <span>Pinned Runner: py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6</span>
        </div>
      </footer>

      {/* Modals */}
      <StakingModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        market={selectedMarketForStake}
        initialSide={stakeSide}
        onConfirmStake={handleConfirmStake}
      />

      <ClaimCenterModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        claimableItems={claimableItems}
        onClaim={handleClaim}
        walletAddress={walletAddress}
      />

      <ProofViewerModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        market={selectedMarketForProof}
      />

      <CreateMarketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateMarket={handleCreateMarket}
      />
    </div>
  );
}
