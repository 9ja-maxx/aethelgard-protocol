import { formatEther, parseEther } from "viem";

export function formatGen(weiString: string | bigint): string {
  try {
    const wei = typeof weiString === "string" ? BigInt(weiString) : weiString;
    const formatted = formatEther(wei);
    const num = parseFloat(formatted);
    if (num === 0) return "0.00";
    if (num < 0.001) return "< 0.001";
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } catch {
    return "0.00";
  }
}

export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeRemaining(deadlineIso: string): { text: string; isExpired: boolean } {
  try {
    const diff = new Date(deadlineIso).getTime() - Date.now();
    if (diff <= 0) {
      return { text: "Staking Closed", isExpired: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return { text: `${days}d ${hours}h left`, isExpired: false };
    if (hours > 0) return { text: `${hours}h ${mins}m left`, isExpired: false };
    return { text: `${mins}m left`, isExpired: false };
  } catch {
    return { text: "Unknown", isExpired: true };
  }
}

export function calculateProjectedPayout(
  stakeGen: number,
  side: "YES" | "NO",
  currentYesGen: number,
  currentNoGen: number
): { projectedReturn: number; multiplier: number } {
  if (stakeGen <= 0) return { projectedReturn: 0, multiplier: 0 };
  
  const newYes = side === "YES" ? currentYesGen + stakeGen : currentYesGen;
  const newNo = side === "NO" ? currentNoGen + stakeGen : currentNoGen;
  const totalPool = newYes + newNo;
  const winningPool = side === "YES" ? newYes : newNo;
  
  if (winningPool <= 0) return { projectedReturn: stakeGen, multiplier: 1 };
  
  const projected = (stakeGen * totalPool) / winningPool;
  const multiplier = projected / stakeGen;
  return { projectedReturn: projected, multiplier };
}
