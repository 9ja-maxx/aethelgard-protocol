"""
Aethelgard Protocol Canonical Instant & Timestamp Normalization Test Suite
=============================================================================
Verifies that deadline checks and time comparisons use mathematically sound
canonical UTC instant comparisons rather than flawed raw ISO-string ordering.
Tests equivalent timestamps across diverse timezone offsets (Z, +02:00, -04:00, +05:30)
and validates staking, resolution, and stale market abandon invariants.
"""

from datetime import datetime, timezone
try:
    import pytest
except ImportError:
    pytest = None


def parse_iso_to_utc_datetime(iso_str: str) -> datetime:
    """
    Robustly parses any ISO-8601 string with any timezone offset into an explicit UTC datetime.
    Supports 'Z', 'z', and numeric offsets (+HH:MM, -HH:MM, +HHMM, -HHMM).
    """
    cleaned = iso_str.strip()
    if cleaned.endswith("Z") or cleaned.endswith("z"):
        cleaned = cleaned[:-1] + "+00:00"
    dt = datetime.fromisoformat(cleaned)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def to_canonical_instant_ts(iso_str: str) -> float:
    """
    Returns the canonical UTC epoch timestamp in seconds for any ISO-8601 string.
    Enforces mathematically consistent instant comparisons across diverse timezone offsets.
    """
    return parse_iso_to_utc_datetime(iso_str).timestamp()


def to_canonical_utc_iso(iso_str: str) -> str:
    """
    Normalizes any valid ISO-8601 timestamp string into canonical UTC ISO-8601 representation.
    """
    dt = parse_iso_to_utc_datetime(iso_str)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


# ===========================================================================
# Test Cases
# ===========================================================================

def test_equivalent_timestamps_across_timezone_offsets():
    """
    Asserts that the same physical instant represented in diverse timezone offsets
    evaluates to the exact same canonical UTC epoch timestamp and canonical ISO string.
    """
    equivalent_instants = [
        "2026-10-01T12:00:00Z",           # UTC baseline
        "2026-10-01T14:00:00+02:00",     # CEST (+2h)
        "2026-10-01T08:00:00-04:00",     # EDT (-4h)
        "2026-10-01T17:30:00+05:30",     # IST (+5:30h)
        "2026-10-01T12:00:00.000000Z",    # Explicit microseconds
    ]

    expected_ts = 1790856000.0
    expected_iso = "2026-10-01T12:00:00Z"

    for iso in equivalent_instants:
        ts = to_canonical_instant_ts(iso)
        canonical_iso = to_canonical_utc_iso(iso)
        assert ts == expected_ts, f"Failed ts match for {iso}: got {ts}, expected {expected_ts}"
        assert canonical_iso == expected_iso, f"Failed canonical ISO for {iso}: got {canonical_iso}"


def test_raw_string_ordering_bug_vs_canonical_instant():
    """
    Demonstrates the critical vulnerability of raw ISO-string comparisons:
    '2026-10-01T12:30:00Z' is physically AFTER '2026-10-01T14:00:00+02:00' (which is 12:00 UTC).
    Raw string comparison returns True ('12' < '14'), which is logically inverted!
    Canonical instant comparison correctly returns False.
    """
    t_later = "2026-10-01T12:30:00Z"         # 12:30 UTC
    t_earlier = "2026-10-01T14:00:00+02:00"  # 12:00 UTC (30 mins earlier than t_later)

    # Flawed raw string comparison:
    # '2026-10-01T12:30:00Z' < '2026-10-01T14:00:00+02:00' evaluates to True because '12' < '14'
    raw_str_result = (t_later < t_earlier)
    assert raw_str_result is True, "Expected raw string comparison to demonstrate inversion bug"

    # Sound canonical instant comparison:
    ts_later = to_canonical_instant_ts(t_later)
    ts_earlier = to_canonical_instant_ts(t_earlier)
    assert ts_later > ts_earlier, "Canonical instant must correctly identify 12:30 UTC as greater than 12:00 UTC"
    assert (ts_later < ts_earlier) is False


def test_staking_deadline_boundary_checks():
    """
    Verifies that staking is strictly accepted before deadline and strictly rejected
    at or after deadline, regardless of which timezone offset the user or consensus node submits.
    """
    deadline_iso = "2026-10-01T12:00:00Z"
    deadline_ts = to_canonical_instant_ts(deadline_iso)

    # 1 second before deadline in Tokyo timezone (+09:00 -> 20:59:59 is 11:59:59 UTC)
    time_before = "2026-10-01T20:59:59+09:00"
    ts_before = to_canonical_instant_ts(time_before)
    can_stake_before = (ts_before < deadline_ts)
    assert can_stake_before is True, "Staking must be allowed before deadline"

    # Exact deadline instant in Pacific timezone (-07:00 -> 05:00:00 is 12:00:00 UTC)
    time_exact = "2026-10-01T05:00:00-07:00"
    ts_exact = to_canonical_instant_ts(time_exact)
    can_stake_exact = (ts_exact < deadline_ts)
    assert can_stake_exact is False, "Staking must be blocked at exact deadline instant"

    # 1 second after deadline in UTC
    time_after = "2026-10-01T12:00:01Z"
    ts_after = to_canonical_instant_ts(time_after)
    can_stake_after = (ts_after < deadline_ts)
    assert can_stake_after is False, "Staking must be blocked after deadline"


def test_premature_resolution_rejection():
    """
    Verifies that resolution is strictly rejected before the canonical deadline instant
    and allowed once the consensus time reaches or passes the deadline.
    """
    deadline_iso = "2026-10-01T12:00:00Z"
    deadline_ts = to_canonical_instant_ts(deadline_iso)

    # Attempt resolution 5 minutes before deadline from offset +01:00 (12:55:00+01:00 is 11:55:00 UTC)
    attempt_early = "2026-10-01T12:55:00+01:00"
    now_early_ts = to_canonical_instant_ts(attempt_early)
    is_premature = (now_early_ts < deadline_ts)
    assert is_premature is True, "Premature resolution check must trigger"

    # Attempt resolution at exact deadline
    attempt_exact = "2026-10-01T12:00:00Z"
    now_exact_ts = to_canonical_instant_ts(attempt_exact)
    assert (now_exact_ts < deadline_ts) is False, "Exact deadline must be eligible for resolution"


def test_abandon_timeout_canonical_calculation():
    """
    Verifies that the emergency 72-hour abandon timeout (259,200 seconds)
    is calculated with mathematical precision across arbitrary timezone inputs.
    """
    ABANDON_TIMEOUT_SECONDS = 259200
    deadline_iso = "2026-10-01T12:00:00Z"
    deadline_ts = to_canonical_instant_ts(deadline_iso)

    # 71 hours and 59 minutes past deadline (abandon not yet allowed)
    now_early = "2026-10-04T11:59:00Z"
    now_early_ts = to_canonical_instant_ts(now_early)
    assert (now_early_ts - deadline_ts) < ABANDON_TIMEOUT_SECONDS

    # Exactly 72 hours past deadline expressed in -05:00 (2026-10-04T07:00:00-05:00 is 12:00:00 UTC)
    now_72h = "2026-10-04T07:00:00-05:00"
    now_72h_ts = to_canonical_instant_ts(now_72h)
    assert (now_72h_ts - deadline_ts) == ABANDON_TIMEOUT_SECONDS

    # 72 hours + 10 seconds past deadline (abandon allowed)
    now_allowed = "2026-10-04T12:00:10Z"
    now_allowed_ts = to_canonical_instant_ts(now_allowed)
    assert (now_allowed_ts - deadline_ts) >= ABANDON_TIMEOUT_SECONDS


if __name__ == "__main__":
    test_equivalent_timestamps_across_timezone_offsets()
    test_raw_string_ordering_bug_vs_canonical_instant()
    test_staking_deadline_boundary_checks()
    test_premature_resolution_rejection()
    test_abandon_timeout_canonical_calculation()
    print("All canonical instant unit tests passed successfully!")
