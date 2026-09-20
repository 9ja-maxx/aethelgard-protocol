#!/usr/bin/env python3
"""
Aethelgard Protocol Deployment Utility
=============================================================================

Prepares and assists in deploying AethelgardMarket to GenLayer StudioNet.
"""

import os
import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

RPC_URL = os.getenv("GENLAYER_RPC_URL", "https://studio.genlayer.com/api")
CONTRACT_PATH = ROOT / "contracts" / "AethelgardMarket.py"


def main():
    print("=" * 70)
    print("  Aethelgard Protocol — Intelligent Contract Deployment")
    print(f"  Target Network: GenLayer StudioNet (RPC: {RPC_URL})")
    print(f"  Contract Path:  {CONTRACT_PATH}")
    print("=" * 70)

    if not CONTRACT_PATH.exists():
        print(f"Error: Contract source not found at {CONTRACT_PATH}")
        sys.exit(1)

    print("\n[DEPLOYMENT INSTRUCTIONS FOR STUDIONET]")
    print("1. Open GenLayer Studio: https://studio.genlayer.com")
    print("2. Connect your funded GenLayer StudioNet account.")
    print("3. Upload contracts/AethelgardMarket.py to the editor.")
    print("4. Verify runner is set to: py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6")
    print("5. Click 'Deploy' and copy the deployed contract address (0x...).")
    print("6. Paste the contract address into .env.local as:")
    print("   NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0xYourAddressHere\n")


if __name__ == "__main__":
    main()
