# BWATS ATS MCP Setup Guide

This document explains how to connect the BWATS ATS MCP server in Claude and other MCP clients.

## MCP Server URLs

- Live (recruiter use):
  - https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream
- Development (testing only):
  - https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0:development/mcp/stream
  - https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0:development/mcp/sse

## Claude Desktop Configuration

Edit `claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "bwats-ats": {
      "url": "https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream"
    }
  }
}
```

Optional dev entry (for testing only):

```json
{
  "mcpServers": {
    "bwats-ats-dev": {
      "url": "https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0:development/mcp/stream"
    }
  }
}
```

## Claude Code CLI

Add MCP server in your CLI MCP settings using the same URLs.

If using fallback API/curl mode, ensure local permissions allow network calls to `xano.atlanticsoft.co`.

## Generic MCP Clients

Use the MCP stream URL directly in your client/server configuration.

- Transport: HTTP stream or SSE (if supported)
- Auth: Bearer token for the MCP server

## Operating Rules

1. Recruiters should use live MCP only.
2. All MCP testing should be done against development MCP.
3. Promote to live only after development validation passes.
4. Keep dev and live toolsets synchronized.
