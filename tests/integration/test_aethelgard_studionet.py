"""
Aethelgard Protocol StudioNet Integration Tests
=============================================================================

Executes against live GenLayer StudioNet RPC & Consensus:
1. Deploys fresh AethelgardMarket instance on StudioNet.
2. Asserts domain whitelist governance queries.
3. Creates an on-chain market with an authorized source URL.
4. Stakes YES and NO with funded accounts, asserting pool accumulation.
5. Confirms pre-deadline resolution attempt correctly reverts on-chain.
6. Confirms source domain allowlist enforcement reverts unauthorized domains.
"""

import pytest

CONTRACT_PATH = "contracts/AethelgardMarket.py"


def test_aethelgard_lifecycle_on_studionet(studionet_deploy, studionet_account_a, studionet_account_b):
    contract = studionet_deploy(CONTRACT_PATH)
    assert contract.address is not None

    # Verify domain whitelist query
    assert contract.is_trusted_domain("reuters.com") is True
    assert contract.is_trusted_domain("nasa.gov") is True
    assert contract.is_trusted_domain("random-blog.xyz") is False

    # 1. Create a real prediction market on StudioNet
    t_deadline = "2028-01-01T00:00:00.000000Z"
    tx_create = contract.create_market(
        "Will the James Webb Space Telescope detect atmospheric biosignatures on an exoplanet by 2028?",
        "Resolves YES if NASA or Nature officially confirms exoplanet atmospheric biosignature detection.",
        t_deadline,
        "https://www.nasa.gov/missions/webb/biosignature-survey",
        "",
        sender=studionet_account_a,
    )
    assert tx_create.tx_execution_succeeded is True
    m_id = tx_create.return_value

    market = contract.get_market(m_id)
    assert market["status"] == 0  # ACTIVE
    assert market["total_yes_stake"] == "0"
    assert market["total_no_stake"] == "0"

    # 2. Stake YES and NO with minimum thresholds
    stake_amount = 1_000_000_000_000_000  # 0.001 GEN
    tx_stake_yes = contract.stake_yes(m_id, sender=studionet_account_a, value=stake_amount)
    assert tx_stake_yes.tx_execution_succeeded is True

    tx_stake_no = contract.stake_no(m_id, sender=studionet_account_b, value=stake_amount * 2)
    assert tx_stake_no.tx_execution_succeeded is True

    updated_market = contract.get_market(m_id)
    assert updated_market["total_yes_stake"] == str(stake_amount)
    assert updated_market["total_no_stake"] == str(stake_amount * 2)
    assert updated_market["total_pool_volume"] == str(stake_amount * 3)

    # 3. Confirm resolve_market before deadline reverts
    tx_resolve = contract.resolve_market(m_id, sender=studionet_account_a)
    assert tx_resolve.tx_execution_succeeded is False


def test_aethelgard_domain_whitelist_rejection_on_studionet(studionet_deploy, studionet_account_a):
    contract = studionet_deploy(CONTRACT_PATH)

    # Attempt to create market with unwhitelisted domain
    t_deadline = "2028-01-01T00:00:00.000000Z"
    tx_fail = contract.create_market(
        "Invalid Source Market",
        "Criteria with sufficient length for validation testing",
        t_deadline,
        "https://unauthorized-tabloid.xyz/fictional-story",
        "",
        sender=studionet_account_a,
    )
    assert tx_fail.tx_execution_succeeded is False
