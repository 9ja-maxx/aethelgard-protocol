import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { parseEther } from "viem";
import { Market, UserStake, ProtocolSummary } from "./types";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || "0xf4a7aD1EBBF6Fe00e2f3fd1b77761aE7d7D32b08";

export function getGenLayerClient(accountOrAddress?: any, provider?: any) {
  const currentProvider =
    provider || (typeof window !== "undefined" ? (window as any).ethereum : undefined);
  return createClient({
    chain: studionet,
    account: accountOrAddress,
    provider: currentProvider,
  });
}

export async function fetchProtocolSummary(client: any): Promise<ProtocolSummary | null> {
  try {
    const res = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_protocol_summary",
      args: [],
    });
    return res as ProtocolSummary;
  } catch (err) {
    console.error("fetchProtocolSummary error:", err);
    return null;
  }
}

export async function fetchMarketCount(client: any): Promise<number> {
  try {
    const res = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_market_count",
      args: [],
    });
    return Number(res);
  } catch (err) {
    console.error("fetchMarketCount error:", err);
    return 0;
  }
}

export async function fetchMarket(client: any, marketId: number): Promise<Market | null> {
  try {
    const data = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_market",
      args: [marketId],
    });
    return data as Market;
  } catch (err) {
    console.error(`fetchMarket(${marketId}) error:`, err);
    return null;
  }
}

export async function fetchUserStake(client: any, marketId: number, userAddress: string): Promise<UserStake | null> {
  try {
    const data = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_user_stake",
      args: [marketId, userAddress],
    });
    return data as UserStake;
  } catch (err) {
    console.error("fetchUserStake error:", err);
    return null;
  }
}

export async function stakeYes(client: any, marketId: number, amountGen: string) {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "stake_yes",
    args: [marketId],
    value: parseEther(amountGen),
  });
}

export async function stakeNo(client: any, marketId: number, amountGen: string) {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "stake_no",
    args: [marketId],
    value: parseEther(amountGen),
  });
}

export async function resolveMarket(client: any, marketId: number) {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "resolve_market",
    args: [marketId],
  });
}

export async function claimPayout(client: any, marketId: number) {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "claim_payout",
    args: [marketId],
  });
}

export async function claimRefund(client: any, marketId: number) {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "claim_refund",
    args: [marketId],
  });
}

export async function claimStaleRefund(client: any, marketId: number) {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "claim_stale_market_refund",
    args: [marketId],
  });
}

export async function createMarket(
  client: any,
  title: string,
  criteria: string,
  deadlineIso: string,
  primaryUrl: string,
  secondaryUrl: string = ""
) {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "create_market",
    args: [title, criteria, primaryUrl, secondaryUrl, deadlineIso],
  });
}
