# Aethelgard Intelligent Contract Specification

## Storage Layout
- `governor: Address` — Deployer address with exclusive domain whitelist governance privileges.
- `market_counter: u32` — Monotonically increasing counter for assigned market IDs.
- `markets: TreeMap[u32, MarketData]` — Primary persistent registry of all initialized prediction markets.
- `user_stakes: TreeMap[str, UserStakeRecord]` — Composite key map `f"{market_id}:{user_hex}"` storing individual YES/NO stakes and claim status.
- `trusted_domains: TreeMap[str, bool]` — Active registry of approved institutional hostnames.

## State Transitions
1. `ACTIVE (0)`: Market is open for payable deposits on YES and NO. Ends when `gl.message.datetime >= deadline_iso`.
2. `PENDING_RESOLUTION (1)`: Staking closed. Awaiting validator retrieval of external web documents.
3. `RESOLVED_YES (2)`: Web consensus verified criteria. YES stakers pull pro-rata pool.
4. `RESOLVED_NO (3)`: Web consensus verified non-occurrence. NO stakers pull pro-rata pool.
5. `ANNULLED (4)`: Criteria ruled contradictory/unresolvable, or zero winners deposited on winning side. 100% symmetric refund pullable.
6. `ABANDONED (5)`: Stale market timeout reached ($\ge 2$ failed attempts, $> 72$h past deadline). 100% symmetric refund pullable.

## Solvency Invariants
- `total_pool_volume == total_yes_stake + total_no_stake`
- `remaining_payout_pool == total_pool_volume - total_claims_paid`
- `contract_balance >= sum(remaining_payout_pool)` across all active/settled markets.
