"""
Aethelgard Protocol Standalone Unit & Algorithm Test Suite
=============================================================================
Verifies contract algorithms, anti-spoofing, parimutuel math, and sanitization
in pure Python environment.
"""

import re
import pytest
from datetime import datetime, timezone
import hashlib

def extract_clean_text(raw_html: str, max_length: int = 6000) -> str:
    if not raw_html:
        return ""
    text = re.sub(r"(?is)<script[^>]*>.*?</script>", " ", raw_html)
    text = re.sub(r"(?is)<style[^>]*>.*?</style>", " ", text)
    text = re.sub(r"(?is)<noscript[^>]*>.*?</noscript>", " ", text)
    text = re.sub(r"(?is)<nav[^>]*>.*?</nav>", " ", text)
    text = re.sub(r"(?is)<header[^>]*>.*?</header>", " ", text)
    text = re.sub(r"(?is)<footer[^>]*>.*?</footer>", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&#39;", "'")
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_length]

def validate_url(url: str, trusted_domains: list) -> str:
    url = url.strip()
    assert url.startswith("http://") or url.startswith("https://"), "URL must use http or https"
    rest = url.split("://", 1)[1]
    assert "@" not in rest.split("/")[0], "Embedded user credentials forbidden"
    authority = rest.split("/")[0].split("?")[0].split("#")[0]
    host = authority.split(":")[0].lower()
    assert len(host) > 0, "Missing host"
    is_approved = any(host == d or host.endswith("." + d) for d in trusted_domains)
    assert is_approved, f"Host {host} is not in trusted registry"
    return url

def calculate_parimutuel_payout(user_stake: int, total_pool: int, winning_pool: int) -> int:
    assert winning_pool > 0
    return (user_stake * total_pool) // winning_pool


# Tests
def test_clean_text_strips_scripts_and_styles():
    html = "<html><head><script>alert(1)</script><style>body{}</style></head><body><header><nav>Home</nav></header><p>Clean content</p><footer>Footer</footer></body></html>"
    clean = extract_clean_text(html)
    assert clean == "Clean content"

def test_url_anti_spoofing_rejects_credentials():
    with pytest.raises(AssertionError, match="Embedded user credentials"):
        validate_url("https://attacker:pass@reuters.com/news", ["reuters.com"])

def test_url_validation_accepts_subdomains():
    url = validate_url("https://world.reuters.com/news", ["reuters.com"])
    assert url == "https://world.reuters.com/news"

def test_parimutuel_math_and_dust_sweeping():
    total_pool = 100_000_000
    winning_pool = 75_000_000
    user_stake = 25_000_000 # 1/3 of winning pool
    payout = calculate_parimutuel_payout(user_stake, total_pool, winning_pool)
    assert payout == 33_333_333
