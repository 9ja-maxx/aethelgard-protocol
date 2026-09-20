"""
Aethelgard Direct Test Harness & Fixtures
=============================================================================
Provides time-warping utilities and mock environment setup for direct VM execution.
"""

import os
import sys
from pathlib import Path

_orig_unlink = os.unlink

def _safe_unlink(path, *args, **kwargs):
    try:
        _orig_unlink(path, *args, **kwargs)
    except PermissionError:
        pass

os.unlink = _safe_unlink

def warp_to(direct_vm, iso: str) -> None:
    """
    Advance the direct VM mock time and synchronize genlayer.gl message state.
    """
    direct_vm.warp(iso)
    gl = sys.modules.get("genlayer.gl")
    if gl is None:
        return
    raw = getattr(gl, "message_raw", None)
    if isinstance(raw, dict):
        raw["datetime"] = iso
    nested = getattr(getattr(gl, "message", None), "raw", None)
    if isinstance(nested, dict):
        nested["datetime"] = iso
