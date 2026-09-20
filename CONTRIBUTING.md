# Contributing to Aethelgard Protocol

We welcome contributions to the Aethelgard clearinghouse architecture.

## Testing Guidelines
- Intelligent Contract modifications must pass all direct tests in `tests/direct/test_aethelgard.py`.
- Run `pytest tests/direct/ -v`.
- Run `genvm-lint check contracts/AethelgardMarket.py` before submitting PRs.

## Solvency Invariant Standards
- Any PR touching payout or refund math must preserve the strict zero-dust solvency invariant.
- All withdrawals must adhere to Checks-Effects-Interactions.
