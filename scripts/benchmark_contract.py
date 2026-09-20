#!/usr/bin/env python3
"""
Aethelgard Contract Benchmark & Static Analysis Tool
=============================================================================
Analyzes contract lines of code, AST complexity, and method counts.
"""

import ast
from pathlib import Path

def analyze():
    p = Path(__file__).resolve().parent.parent / "contracts" / "AethelgardMarket.py"
    with open(p, "r") as f:
        code = f.read()

    tree = ast.parse(code)
    classes = [n for n in tree.body if isinstance(n, ast.ClassDef)]
    methods = [n for n in classes[0].body if isinstance(n, ast.FunctionDef)] if classes else []

    print(f"Contract File: {p.name}")
    print(f"Total Lines: {len(code.splitlines())}")
    print(f"Total Methods: {len(methods)}")
    for m in methods:
        print(f"  - {m.name}")

if __name__ == "__main__":
    analyze()
