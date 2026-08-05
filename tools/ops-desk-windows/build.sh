#!/usr/bin/env bash
# Builds OpsDesk.exe. Run from anywhere; paths are relative to this script.
#
# Requires: Node.js, and `pkg` (installed globally: npm install -g pkg).
# Run this from a directory with no node_modules alongside it —
# pkg bundles everything it finds in the project directory by default,
# including its own tooling if pkg itself is installed locally here.

set -euo pipefail
cd "$(dirname "$0")"

cp ../ops-desk.html ./ops-desk.html

if ! command -v pkg >/dev/null 2>&1; then
  echo "pkg not found. Install it globally first: npm install -g pkg" >&2
  exit 1
fi

pkg . --output dist/OpsDesk.exe

rm -f ./ops-desk.html

echo "Built dist/OpsDesk.exe"
