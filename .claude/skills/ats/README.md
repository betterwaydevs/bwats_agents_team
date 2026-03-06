# ATS Skill (MCP + CLI Fallback)

This skill supports two execution modes:

1. MCP mode (preferred): uses BWATS_ATS MCP tools.
2. CLI fallback mode: uses direct API calls with curl.

## MCP Setup (Claude Desktop / Cowork)

Add this server to your Claude MCP config:

```json
{
  "mcpServers": {
    "bwats-ats": {
      "url": "https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream"
    }
  }
}
```

## Branch-Aware MCP URLs (Required)

Use branch-specific MCP URLs for safe testing and release:

- Live MCP:
  - `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream`
- Development MCP:
  - `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0:development/mcp/stream`
  - `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0:development/mcp/sse`

Policy:
- All MCP branch tests must run against the `:development` URL.
- Only validated tools are pushed/promoted to live MCP.
- Maintain both dev and live MCP toolsets in sync.

## Runtime Check Behavior

On startup, the skill checks whether BWATS_ATS MCP tools are available.

If MCP is missing or unreachable, the skill must stop and show this guidance:

- Add the BWATS_ATS MCP server URL above for Desktop/Cowork mode.
- Or run in Claude Code CLI with network permission to `xano.atlanticsoft.co`.
- If using CLI, allow `curl` and `WebFetch(domain:xano.atlanticsoft.co)` in `.claude/settings.local.json`.

## Clean Project Deletion Flow (MCP)

For deleting projects cleanly:

1. Unassign all people from project associations (`unassign_person`).
2. Delete all stages (`delete_stage`).
3. Delete the project (`delete_project`).

If unassign fails due pending/executing tasks, resolve tasks first, then retry.
