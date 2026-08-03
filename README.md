# Viora AI Studio

Viora is a local-first AI video creation runtime built on SRK. It can be used
from Codex or any MCP-capable client, and from a terminal without a desktop UI.

## Quick use

```bash
node apps/studio-desktop/bin/viora.mjs project create --project ./demo.viora --name Demo
node apps/studio-desktop/bin/viora.mjs media import ./sample.mp4 --project ./demo.viora
node apps/studio-desktop/bin/viora.mjs timeline add --project ./demo.viora --track v1 --start 0 --duration 5000
node apps/studio-desktop/bin/viora.mjs render export --project ./demo.viora --output ./renders/demo.mp4
```

When `--asset` is omitted, the CLI uses the most recently imported asset.

## Codex

The repository includes `.codex/config.toml`. Open the repository as a Codex
project, reload it or start a new task, and ask Codex to use Viora. See
`docs/integrations/cli-and-mcp-quickstart.md` for MCP details.

The current export command produces a deterministic `.viora-render.json` plan;
FFmpeg execution is isolated behind the render adapter for the next runtime step.