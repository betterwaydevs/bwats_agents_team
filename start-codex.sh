#!/usr/bin/env bash
# BWATS Team — Codex Launcher
# Launches Codex from the team/ folder with orchestrator defaults.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           BWATS Codex Team Launcher               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

CONTINUE_FLAG=""
BACKEND_ONLY=false
SAFE_MODE=false
SEARCH_MODE=true

for arg in "$@"; do
  case $arg in
    --continue)
      CONTINUE_FLAG="--continue"
      echo -e "${YELLOW}→ Resuming previous session${NC}"
      ;;
    --backend)
      BACKEND_ONLY=true
      echo -e "${YELLOW}→ Backend-only mode (bwats_xano)${NC}"
      ;;
    --safe)
      SAFE_MODE=true
      echo -e "${YELLOW}→ Safe mode enabled (approval prompts on-request)${NC}"
      ;;
    --no-search)
      SEARCH_MODE=false
      echo -e "${YELLOW}→ Web search disabled${NC}"
      ;;
    *)
      echo -e "${RED}Unknown flag: $arg${NC}"
      echo "Usage: ./start-codex.sh [--continue] [--backend] [--safe] [--no-search]"
      exit 1
      ;;
  esac
done

echo ""
echo -e "${CYAN}Checking Codex agent definitions...${NC}"
AGENTS_DIR="$SCRIPT_DIR/.codex/agents"

if [ -d "$AGENTS_DIR" ]; then
  AGENT_COUNT=$(find "$AGENTS_DIR" -name "*.md" -maxdepth 1 | wc -l)
  echo -e "  ${GREEN}✓${NC} Found $AGENT_COUNT agent(s) in .codex/agents/"
  for agent_file in "$AGENTS_DIR"/*.md; do
    agent_name=$(basename "$agent_file" .md)
    echo -e "    - $agent_name"
  done
else
  echo -e "  ${RED}✗${NC} Agent definitions directory not found: $AGENTS_DIR"
  exit 1
fi

echo ""
echo -e "${CYAN}Checking Codex CLI...${NC}"
if command -v codex &> /dev/null; then
  CODEX_VERSION=$(codex --version 2>/dev/null || echo "unknown")
  echo -e "  ${GREEN}✓${NC} Codex CLI installed ($CODEX_VERSION)"
else
  echo -e "  ${RED}✗${NC} Codex CLI not found in PATH"
  echo "  Install/configure Codex CLI first, then re-run this script."
  exit 1
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
if [ "$BACKEND_ONLY" = true ]; then
  echo -e "${GREEN}Launching Codex in backend-only mode (bwats_xano)...${NC}"
  cd "$SCRIPT_DIR/../bwats_xano"
  CODEX_ARGS=()
  if [ "$SAFE_MODE" = true ]; then
    CODEX_ARGS+=(-a on-request -s workspace-write)
  else
    CODEX_ARGS+=(-a never -s workspace-write)
  fi
  if [ "$SEARCH_MODE" = true ]; then
    CODEX_ARGS+=(--search)
  fi
  exec codex $CONTINUE_FLAG "${CODEX_ARGS[@]}"
else
  echo -e "${GREEN}Launching Codex in team mode...${NC}"
  echo -e "  Working directory: $SCRIPT_DIR"
  echo -e "  Instructions: AGENTS.md + .codex/agents"
  if [ "$SAFE_MODE" = true ]; then
    echo -e "  Approvals: on-request (safe mode)"
  else
    echo -e "  Approvals: never (default)"
  fi
  if [ "$SEARCH_MODE" = true ]; then
    echo -e "  Web search: enabled"
  else
    echo -e "  Web search: disabled"
  fi
  echo ""
  # Make all sibling BWATS project folders writable for this session.
  # This allows delegated subagents to edit project repos from the team orchestrator session.
  mapfile -t BWATS_DIRS < <(find "$SCRIPT_DIR/.." -mindepth 1 -maxdepth 1 -type d)
  CODEX_ARGS=()
  if [ "$SAFE_MODE" = true ]; then
    CODEX_ARGS+=(-a on-request -s workspace-write)
  else
    CODEX_ARGS+=(-a never -s workspace-write)
  fi
  if [ "$SEARCH_MODE" = true ]; then
    CODEX_ARGS+=(--search)
  fi
  for d in "${BWATS_DIRS[@]}"; do
    CODEX_ARGS+=(--add-dir "$d")
  done

  exec codex $CONTINUE_FLAG "${CODEX_ARGS[@]}"
fi
