#!/usr/bin/env bash
# Sync Claude agent definitions to Codex agent definitions.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SRC="$ROOT_DIR/.claude/agents"
DST="$ROOT_DIR/.codex/agents"

if [ ! -d "$SRC" ]; then
  echo "Source directory not found: $SRC"
  exit 1
fi

mkdir -p "$DST"
cp "$SRC"/*.md "$DST"/

echo "Synced agent files from .claude/agents to .codex/agents"
ls -1 "$DST"
