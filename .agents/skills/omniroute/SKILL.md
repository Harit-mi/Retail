---
name: omniroute
description: Configures and manages diegosouzapw/OmniRoute as a unified local AI gateway, OpenAI-compatible endpoint, and MCP server for Google Antigravity agents. Use when the user asks to connect OmniRoute, route AI models (Claude, Gemini, DeepSeek, GPT-4o), enable token compression, or setup multi-provider failover.
---

# OmniRoute AI Gateway for Google Antigravity

[diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) is an open-source AI gateway that unifies 290+ AI providers (90+ free models) and 500+ models under a single OpenAI-compatible local endpoint (`http://localhost:20128/v1`).

---

## 1. Features & Capabilities

- **Unified OpenAI Endpoint**: Exposes standard `/v1/chat/completions` for Cursor, Claude Code, Antigravity SDK, and custom agents.
- **Quota-Aware Auto-Fallback**: Automatically switches models if quota or rate limits are hit.
- **RTK + Caveman Prompt Compression**: Reduces prompt token usage by 15%–95%.
- **MCP & A2A Support**: Exposes Model Context Protocol tools for agentic systems.

---

## 2. Quick Installation & Launch

Run OmniRoute via `npx` or `npm`:

```bash
# Start OmniRoute Local AI Gateway & Dashboard
npx -y omniroute
```

- **Local Dashboard**: `http://localhost:20128`
- **OpenAI Compatible Endpoint**: `http://localhost:20128/v1`

---

## 3. Configuring Antigravity to Use OmniRoute

Add OmniRoute configuration to `~/.gemini/antigravity-cli/settings.json` or environment variables:

```json
{
  "model": "google/gemini-2.5-flash",
  "apiBaseUrl": "http://localhost:20128/v1",
  "openAiApiKey": "omniroute-local-key"
}
```

### Environment Variables
```bash
export OPENAI_API_BASE="http://localhost:20128/v1"
export OPENAI_API_KEY="omniroute-local-key"
```

---

## 4. Registering OmniRoute MCP Server in Antigravity

To register OmniRoute's MCP server tools in Antigravity, add the following to `~/.gemini/antigravity-cli/mcp.json` or `/mcp` setting:

```json
{
  "mcpServers": {
    "omniroute": {
      "command": "npx",
      "args": ["-y", "omniroute", "--mcp"]
    }
  }
}
```
