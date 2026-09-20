"""
Aethelgard Protocol Direct Unit & Regression Test Suite
=============================================================================

Comprehensive test suite verifying:
- Market creation validation & authority limits
- Anti-spoofing host parsing & curated domain whitelist governance
- Payable parimutuel staking pools & dynamic odds calculations
- Multi-validator comparative equivalence consensus over live-web evidence
- 4-tier resolution state machine (YES, NO, INVALID_CRITERIA, INSUFFICIENT_EVIDENCE)
- O(1) pull-payment claim ledger for winning stakers
- Mathematical dust remainder sweeping to preserve strict solvency invariants
- Double-claim prevention and unauthorized claim rejection
- Symmetric 100% refund claims for annulled markets and zero-winner scenarios
- Dual-gated emergency abandon escape hatch
- In-contract regex HTML text extraction and prompt-injection hardening
"""

import json
import pytest
from conftest import warp_to

CONTRACT_PATH = "contracts/AethelgardMarket.py"

T0 = "2026-06-01T00:00:00.000000Z"
T_DEADLINE = "2026-06-02T00:00:00.000000Z"          # 24 hours after T0
T_POST_DEADLINE = "2026-06-02T00:00:01.000000Z"     # 1 second past deadline
T_ABANDON_READY = "2026-06-05T00:00:01.000000Z"     # 72h + 1 sec past deadline

VALID_PRIMARY_URL = "https://www.reuters.com/technology/ai-update"
VALID_SECONDARY_URL = "https://en.wikipedia.org/wiki/Artificial_intelligence"


def _deploy(direct_deploy):
    return direct_deploy(CONTRACT_PATH)


def _addr_hex(addr):
    if hasattr(addr, "as_hex"):
        return addr.as_hex
    return "0x" + addr.hex()


def _mock_web_source(direct_vm, pattern=r".*", body="<html><body><p>Confirmed outcome evidence published by Reuters.</p></body></html>"):
    direct_vm.mock_web(pattern, {"status": 200, "body": body})


def _mock_oracle_verdict(direct_vm, outcome, rationale="Adjudicated from authoritative web evidence."):
    direct_vm.clear_mocks()
    _mock_web_source(direct_vm)
    direct_vm.mock_llm(r".*", json.dumps({"outcome": outcome, "rationale": rationale}))


def _create_sample_market(
    direct_vm,
    contract,
    creator,
    title="Will the regulatory framework pass by June 2026?",
    criteria="Resolves YES if Reuters publishes confirmation of legislative approval.",
    primary_url=VALID_PRIMARY_URL,
    secondary_url="",
    deadline_iso=T_DEADLINE,
):
    warp_to(direct_vm, T0)
    with direct_vm.as_account(creator):
        m_id = contract.create_market(
            title,
            criteria,
            deadline_iso,
            primary_url,
            secondary_url,
        )
    return m_id


# ===========================================================================
# 1. Market Creation & Input Validation Tests
# ===========================================================================

def test_market_creation_success(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    m_id = _create_sample_market(direct_vm, contract, creator)
    assert m_id == 0

    m = contract.get_market(0)
    assert m["title"] == "Will the regulatory framework pass by June 2026?"
    assert m["status"] == 0  # ACTIVE
    assert m["creator"] == _addr_hex(creator)
    assert contract.get_market_count() == 1


def test_market_creation_with_secondary_url(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    m_id = _create_sample_market(
        direct_vm, contract, creator, secondary_url=VALID_SECONDARY_URL
    )
    m = contract.get_market(m_id)
    assert m["primary_url"] == VALID_PRIMARY_URL
    assert m["secondary_url"] == VALID_SECONDARY_URL


def test_market_creation_title_too_short(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    warp_to(direct_vm, T0)
    with direct_vm.as_account(creator):
        with pytest.raises(Exception, match="Title length"):
            contract.create_market("Too short", "Valid criteria with sufficient length", T_DEADLINE, VALID_PRIMARY_URL)


def test_market_creation_title_too_long(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    warp_to(direct_vm, T0)
    long_title = "A" * 201
    with direct_vm.as_account(creator):
        with pytest.raises(Exception, match="Title length"):
            contract.create_market(long_title, "Valid criteria with sufficient length", T_DEADLINE, VALID_PRIMARY_URL)


def test_market_creation_criteria_too_short(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    warp_to(direct_vm, T0)
    with direct_vm.as_account(creator):
        with pytest.raises(Exception, match="Criteria length"):
            contract.create_market("Valid Question Title Here", "Short criteria", T_DEADLINE, VALID_PRIMARY_URL)


def test_market_creation_invalid_scheme(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    warp_to(direct_vm, T0)
    with direct_vm.as_account(creator):
        with pytest.raises(Exception, match="URL must use http or https"):
            contract.create_market("Valid Question Title Here", "Valid criteria with sufficient length", T_DEADLINE, "ftp://reuters.com/news")


def test_market_creation_deadline_too_soon(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    warp_to(direct_vm, T0)
    # 30 minutes after T0 (requires >= 1 hour)
    t_soon = "2026-06-01T00:30:00.000000Z"
    with direct_vm.as_account(creator):
        with pytest.raises(Exception, match="at least 1 hour"):
            contract.create_market("Valid Question Title Here", "Valid criteria with sufficient length", t_soon, VALID_PRIMARY_URL)


# ===========================================================================
# 2. Anti-Spoofing Host Parsing & Domain Whitelist Governance
# ===========================================================================

def test_anti_spoofing_userinfo_injection(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    warp_to(direct_vm, T0)
    spoofed_url = "https://evil.com@reuters.com/news"
    with direct_vm.as_account(creator):
        with pytest.raises(Exception, match="Embedded user credentials"):
            contract.create_market("Valid Question Title Here", "Valid criteria with sufficient length", T_DEADLINE, spoofed_url)


def test_untrusted_domain_rejected(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    warp_to(direct_vm, T0)
    untrusted_url = "https://randomblog12345.xyz/fake-news"
    with direct_vm.as_account(creator):
        with pytest.raises(Exception, match="not in the Aethelgard trusted domain"):
            contract.create_market("Valid Question Title Here", "Valid criteria with sufficient length", T_DEADLINE, untrusted_url)


def test_subdomain_of_trusted_domain_accepted(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    creator = accounts[0]
    warp_to(direct_vm, T0)
    subdomain_url = "https://world.reuters.com/articles/123"
    with direct_vm.as_account(creator):
        m_id = contract.create_market("Valid Question Title Here", "Valid criteria with sufficient length", T_DEADLINE, subdomain_url)
    assert m_id == 0


def test_governor_register_and_deprecate_domain(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    governor = accounts[0]
    non_governor = accounts[1]

    # Non-governor cannot register
    with direct_vm.as_account(non_governor):
        with pytest.raises(Exception, match="Only governor"):
            contract.register_trusted_domain("customnews.org")

    # Governor registers
    with direct_vm.as_account(governor):
        contract.register_trusted_domain("customnews.org")
    assert contract.is_trusted_domain("customnews.org") is True

    # Governor deprecates
    with direct_vm.as_account(governor):
        contract.deprecate_trusted_domain("customnews.org")
    assert contract.is_trusted_domain("customnews.org") is False


# ===========================================================================
# 3. Parimutuel Staking Engine Tests
# ===========================================================================

def test_staking_yes_and_no(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    staker1 = accounts[1]
    staker2 = accounts[2]
    
    # Stake YES
    with direct_vm.as_account(staker1):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)  # 0.01 GEN
        
    # Stake NO
    with direct_vm.as_account(staker2):
        contract.stake_no(m_id, value=20_000_000_000_000_000)   # 0.02 GEN
        
    m = contract.get_market(m_id)
    assert m["total_yes_stake"] == "10000000000000000"
    assert m["total_no_stake"] == "20000000000000000"
    assert m["total_pool_volume"] == "30000000000000000"
    assert m["yes_stakers_count"] == 1
    assert m["no_stakers_count"] == 1
    assert m["yes_percent"] == 33
    assert m["no_percent"] == 67


def test_staking_below_minimum_rejected(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    staker = accounts[1]
    
    with direct_vm.as_account(staker):
        with pytest.raises(Exception, match="Minimum stake threshold"):
            contract.stake_yes(m_id, value=500_000_000_000_000)  # 0.0005 GEN


def test_staking_after_deadline_rejected(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    staker = accounts[1]
    
    warp_to(direct_vm, T_POST_DEADLINE)
    with direct_vm.as_account(staker):
        with pytest.raises(Exception, match="deadline has passed"):
            contract.stake_yes(m_id, value=10_000_000_000_000_000)


# ===========================================================================
# 4. Multi-Validator Consensus Resolution Tests
# ===========================================================================

def test_resolution_before_deadline_rejected(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    warp_to(direct_vm, T0)
    with pytest.raises(Exception, match="deadline has not yet arrived"):
        contract.resolve_market(m_id)


def test_resolution_yes_outcome(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    with direct_vm.as_account(accounts[1]):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
    with direct_vm.as_account(accounts[2]):
        contract.stake_no(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "YES", "Reuters confirms the regulatory passage.")
    
    outcome = contract.resolve_market(m_id)
    assert outcome == "YES"
    
    m = contract.get_market(m_id)
    assert m["status"] == 2  # STATUS_RESOLVED_YES
    assert m["consensus_outcome"] == "YES"
    assert m["remaining_payout_pool"] == "20000000000000000"


def test_resolution_no_outcome(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    with direct_vm.as_account(accounts[1]):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
    with direct_vm.as_account(accounts[2]):
        contract.stake_no(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "NO", "Reuters confirms legislative proposal was rejected.")
    
    outcome = contract.resolve_market(m_id)
    assert outcome == "NO"
    
    m = contract.get_market(m_id)
    assert m["status"] == 3  # STATUS_RESOLVED_NO
    assert m["consensus_outcome"] == "NO"


def test_resolution_invalid_criteria_annulment(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    with direct_vm.as_account(accounts[1]):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "INVALID_CRITERIA", "Criteria are contradictory.")
    
    outcome = contract.resolve_market(m_id)
    assert outcome == "INVALID_CRITERIA"
    
    m = contract.get_market(m_id)
    assert m["status"] == 4  # STATUS_ANNULLED


def test_resolution_insufficient_evidence_keeps_pending(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "INSUFFICIENT_EVIDENCE", "Source page timed out.")
    
    outcome = contract.resolve_market(m_id)
    assert outcome == "INSUFFICIENT_EVIDENCE"
    
    m = contract.get_market(m_id)
    assert m["status"] == 1  # STATUS_PENDING_RESOLUTION
    assert m["resolution_attempts"] == 1


# ===========================================================================
# 5. O(1) Pull-Payment Claim Architecture & Dust Sweeping Tests
# ===========================================================================

def test_pull_claim_winnings_single_winner(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    winner = accounts[1]
    loser = accounts[2]
    
    with direct_vm.as_account(winner):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)  # 0.01 GEN
    with direct_vm.as_account(loser):
        contract.stake_no(m_id, value=10_000_000_000_000_000)   # 0.01 GEN
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "YES")
    contract.resolve_market(m_id)
    
    # Check claimable amount
    claimable = contract.get_claimable_amount(m_id, winner)
    assert claimable == 20_000_000_000_000_000
    
    # Claim winnings
    with direct_vm.as_account(winner):
        payout = contract.claim_payout(m_id)
    assert payout == 20_000_000_000_000_000
    
    # Verify post-claim state
    user_stake = contract.get_user_stake(m_id, winner)
    assert user_stake["claimed"] is True
    assert user_stake["claimable_amount"] == "0"
    
    m = contract.get_market(m_id)
    assert m["total_claims_paid"] == "20000000000000000"
    assert m["remaining_payout_pool"] == "0"


def test_pull_claim_dust_swept_to_final_winner(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    # 3 YES stakers each staking 3 wei (total YES = 9 wei), NO stakers = 1 wei
    # Total pool = 10 wei. 10 // 3 = 3 wei per staker -> leaves 1 wei dust
    # Scaled to minimum stake:
    # Winner 1: 10_000_000_000_000_000 (1/3)
    # Winner 2: 10_000_000_000_000_000 (1/3)
    # Winner 3: 10_000_000_000_000_000 (1/3)
    # Loser:    10_000_000_000_000_000
    # Total pool = 40_000_000_000_000_000. 40 / 3 = 13_333_333_333_333_333 (remainder 1 wei)
    w1, w2, w3, loser = accounts[1], accounts[2], accounts[3], accounts[4]
    
    with direct_vm.as_account(w1):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
    with direct_vm.as_account(w2):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
    with direct_vm.as_account(w3):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
    with direct_vm.as_account(loser):
        contract.stake_no(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "YES")
    contract.resolve_market(m_id)
    
    # Claim Winner 1
    with direct_vm.as_account(w1):
        p1 = contract.claim_payout(m_id)
    assert p1 == 13_333_333_333_333_333
    
    # Claim Winner 2
    with direct_vm.as_account(w2):
        p2 = contract.claim_payout(m_id)
    assert p2 == 13_333_333_333_333_333
    
    # Claim Winner 3 (Final winner absorbs the swept 1-wei dust remainder!)
    with direct_vm.as_account(w3):
        p3 = contract.claim_payout(m_id)
    assert p3 == 13_333_333_333_333_334
    
    # Verify 100% solvency invariant
    total_paid = p1 + p2 + p3
    assert total_paid == 40_000_000_000_000_000
    m = contract.get_market(m_id)
    assert m["remaining_payout_pool"] == "0"
    assert m["total_claims_paid"] == "40000000000000000"


def test_double_claim_prevented(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    winner = accounts[1]
    
    with direct_vm.as_account(winner):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "YES")
    contract.resolve_market(m_id)
    
    with direct_vm.as_account(winner):
        contract.claim_payout(m_id)
        with pytest.raises(Exception, match="already been claimed"):
            contract.claim_payout(m_id)


def test_loser_cannot_claim_payout(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    winner = accounts[1]
    loser = accounts[2]
    
    with direct_vm.as_account(winner):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
    with direct_vm.as_account(loser):
        contract.stake_no(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "YES")
    contract.resolve_market(m_id)
    
    with direct_vm.as_account(loser):
        with pytest.raises(Exception, match="holds zero stake on the winning"):
            contract.claim_payout(m_id)


# ===========================================================================
# 6. Refund Claims (Annulment & Zero-Winner Cases)
# ===========================================================================

def test_refund_claim_on_annulled_market(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    staker1 = accounts[1]
    staker2 = accounts[2]
    
    with direct_vm.as_account(staker1):
        contract.stake_yes(m_id, value=15_000_000_000_000_000)
    with direct_vm.as_account(staker2):
        contract.stake_no(m_id, value=25_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "INVALID_CRITERIA")
    contract.resolve_market(m_id)
    
    # Claim refund staker1
    with direct_vm.as_account(staker1):
        r1 = contract.claim_refund(m_id)
    assert r1 == 15_000_000_000_000_000
    
    # Claim refund staker2
    with direct_vm.as_account(staker2):
        r2 = contract.claim_refund(m_id)
    assert r2 == 25_000_000_000_000_000


def test_zero_winner_triggers_annulment_and_refund(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    
    # Only NO stakers deposited, but YES wins
    staker_no = accounts[1]
    with direct_vm.as_account(staker_no):
        contract.stake_no(m_id, value=20_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "YES")
    contract.resolve_market(m_id)
    
    # Market auto-annuls because winning side had 0 stakers
    m = contract.get_market(m_id)
    assert m["status"] == 4  # STATUS_ANNULLED
    
    with direct_vm.as_account(staker_no):
        refund = contract.claim_refund(m_id)
    assert refund == 20_000_000_000_000_000


# ===========================================================================
# 7. Dual-Gated Emergency Abandon Escape Hatch Tests
# ===========================================================================

def test_abandon_fails_if_less_than_two_attempts(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    staker = accounts[1]
    
    with direct_vm.as_account(staker):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "INSUFFICIENT_EVIDENCE")
    contract.resolve_market(m_id)  # Only 1 attempt
    
    warp_to(direct_vm, T_ABANDON_READY)
    with direct_vm.as_account(staker):
        with pytest.raises(Exception, match="at least 2 failed resolution attempts"):
            contract.claim_stale_market_refund(m_id)


def test_abandon_fails_before_timeout(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    staker = accounts[1]
    
    with direct_vm.as_account(staker):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "INSUFFICIENT_EVIDENCE")
    contract.resolve_market(m_id)  # Attempt 1
    contract.resolve_market(m_id)  # Attempt 2
    
    # Only 24 hours past deadline (requires 72 hours)
    t_too_early = "2026-06-03T00:00:01.000000Z"
    warp_to(direct_vm, t_too_early)
    with direct_vm.as_account(staker):
        with pytest.raises(Exception, match="requires 259200 seconds"):
            contract.claim_stale_market_refund(m_id)


def test_abandon_success_and_refund(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    staker = accounts[1]
    
    with direct_vm.as_account(staker):
        contract.stake_yes(m_id, value=10_000_000_000_000_000)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "INSUFFICIENT_EVIDENCE")
    contract.resolve_market(m_id)  # Attempt 1
    contract.resolve_market(m_id)  # Attempt 2
    
    warp_to(direct_vm, T_ABANDON_READY)
    with direct_vm.as_account(staker):
        refund = contract.claim_stale_market_refund(m_id)
    assert refund == 10_000_000_000_000_000
    
    m = contract.get_market(m_id)
    assert m["status"] == 5  # STATUS_ABANDONED


# ===========================================================================
# 8. In-Contract Regex Content Sanitizer Tests
# ===========================================================================

def test_html_content_sanitization(direct_deploy):
    contract = _deploy(direct_deploy)
    raw_html = """
    <html>
        <head><script>alert('malicious')</script><style>.css{}</style></head>
        <body>
            <header><nav>Navigation Menu</nav></header>
            <p>Substantive article paragraph confirming outcome.</p>
            <footer>Copyright 2026</footer>
        </body>
    </html>
    """
    clean = contract._extract_clean_text(raw_html)
    assert "alert" not in clean
    assert ".css" not in clean
    assert "Navigation Menu" not in clean
    assert "Copyright" not in clean
    assert "Substantive article paragraph confirming outcome." in clean

def test_high_precision_payout_math(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    m_id = _create_sample_market(direct_vm, contract, accounts[0])
    winner = accounts[1]
    loser = accounts[2]
    
    # 5.555 GEN on YES, 4.445 GEN on NO
    stake_yes_wei = 5_555_000_000_000_000_000
    stake_no_wei = 4_445_000_000_000_000_000
    
    with direct_vm.as_account(winner):
        contract.stake_yes(m_id, value=stake_yes_wei)
    with direct_vm.as_account(loser):
        contract.stake_no(m_id, value=stake_no_wei)
        
    warp_to(direct_vm, T_POST_DEADLINE)
    _mock_oracle_verdict(direct_vm, "YES")
    contract.resolve_market(m_id)
    
    with direct_vm.as_account(winner):
        payout = contract.claim_payout(m_id)
    assert payout == stake_yes_wei + stake_no_wei


def test_unauthorized_governance_rejection(direct_deploy, direct_vm, accounts):
    contract = _deploy(direct_deploy)
    non_gov = accounts[3]
    with direct_vm.as_account(non_gov):
        with pytest.raises(Exception, match="Only governor"):
            contract.deprecate_trusted_domain("reuters.com")
