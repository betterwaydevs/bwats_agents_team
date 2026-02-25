#!/usr/bin/env bash
# BWATS Team — Launch Script
# Launches Claude Code from the team/ folder with multi-agent team support.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          BWATS Multi-Agent Team Launcher          ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# --- Parse flags ---
CONTINUE_FLAG=""
BACKEND_ONLY=false

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
    *)
      echo -e "${RED}Unknown flag: $arg${NC}"
      echo "Usage: ./start-team.sh [--continue] [--backend]"
      exit 1
      ;;
  esac
done

# --- Load .env ---
echo -e "${CYAN}Loading environment...${NC}"
ENV_FILE="$SCRIPT_DIR/.env"

if [ -L "$ENV_FILE" ]; then
  # Resolve symlink
  REAL_ENV="$(readlink -f "$ENV_FILE")"
  if [ -f "$REAL_ENV" ]; then
    set -a
    source "$REAL_ENV"
    set +a
    echo -e "  ${GREEN}✓${NC} Loaded .env (→ $REAL_ENV)"
  else
    echo -e "  ${RED}✗${NC} .env symlink target not found: $REAL_ENV"
    exit 1
  fi
elif [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
  echo -e "  ${GREEN}✓${NC} Loaded .env"
else
  echo -e "  ${RED}✗${NC} No .env file found"
  exit 1
fi

# --- Verify XANO_TOKEN ---
if [ -z "${XANO_TOKEN:-}" ]; then
  echo -e "  ${RED}✗${NC} XANO_TOKEN is not set"
  exit 1
else
  TOKEN_PREVIEW="${XANO_TOKEN:0:20}..."
  echo -e "  ${GREEN}✓${NC} XANO_TOKEN is set ($TOKEN_PREVIEW)"
fi

# --- Check agent definitions ---
echo ""
echo -e "${CYAN}Checking agent definitions...${NC}"
AGENTS_DIR="$SCRIPT_DIR/.claude/agents"

if [ -d "$AGENTS_DIR" ]; then
  AGENT_COUNT=$(find "$AGENTS_DIR" -name "*.md" -maxdepth 1 | wc -l)
  echo -e "  ${GREEN}✓${NC} Found $AGENT_COUNT agent(s) in .claude/agents/"
  for agent_file in "$AGENTS_DIR"/*.md; do
    agent_name=$(basename "$agent_file" .md)
    echo -e "    - $agent_name"
  done
else
  echo -e "  ${RED}✗${NC} Agent definitions directory not found: $AGENTS_DIR"
  exit 1
fi

# --- Check subproject directories ---
echo ""
echo -e "${CYAN}Checking subprojects...${NC}"

PROJECTS=(
  "bwats_xano:Xano Backend"
  "nearshore-talent-compass:React Frontend"
  "linked_communication:Chrome Extension (LinkedIn)"
  "bw_cold_recruiting:Chrome Extension (Recruiting)"
  "resume_parser:Python Data Processing"
)

ALL_PROJECTS_OK=true
for project_entry in "${PROJECTS[@]}"; do
  IFS=':' read -r project_dir project_name <<< "$project_entry"
  project_path="$SCRIPT_DIR/../$project_dir"
  if [ -d "$project_path" ]; then
    echo -e "  ${GREEN}✓${NC} $project_name ($project_dir/)"
  else
    echo -e "  ${RED}✗${NC} $project_name ($project_dir/) — NOT FOUND"
    ALL_PROJECTS_OK=false
  fi
done

if [ "$ALL_PROJECTS_OK" = false ]; then
  echo -e "\n${RED}Some subprojects are missing. Continue anyway? (y/N)${NC}"
  read -r answer
  if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    exit 1
  fi
fi

# --- Check Claude CLI ---
echo ""
echo -e "${CYAN}Checking Claude CLI...${NC}"

if command -v claude &> /dev/null; then
  CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "unknown")
  echo -e "  ${GREEN}✓${NC} Claude CLI installed ($CLAUDE_VERSION)"
else
  echo -e "  ${RED}✗${NC} Claude CLI not found. Install: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

# --- Check MCP config ---
echo ""
echo -e "${CYAN}Checking MCP configuration...${NC}"
if [ -f "$SCRIPT_DIR/.mcp.json" ]; then
  echo -e "  ${GREEN}✓${NC} .mcp.json found (Xano MCP server)"
else
  echo -e "  ${YELLOW}⚠${NC} .mcp.json not found — MCP tools will not be available"
fi

# --- Launch ---
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"

if [ "$BACKEND_ONLY" = true ]; then
  echo -e "${GREEN}Launching Claude Code in backend-only mode (bwats_xano)...${NC}"
  cd "$SCRIPT_DIR/../bwats_xano"
  exec claude $CONTINUE_FLAG
else
  echo -e "${GREEN}Launching Claude Code with team agents...${NC}"
  echo -e "  Working directory: $SCRIPT_DIR"
  echo -e "  Agent teams: enabled"
  echo ""
  exec claude $CONTINUE_FLAG
fi
