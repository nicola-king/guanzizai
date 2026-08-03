# Viora AI Studio project instructions

This repository is Viora AI Studio. When working in this project, prefer the
local `viora` MCP server configured in `.codex/config.toml` for project, media,
timeline and render operations.

Use the shared SRK command path. Do not create a separate mock editor workflow
in the conversation. For a normal first action, create/open a project, inspect
it, then use `media.import`, `timeline.clip.add`, `timeline.inspect` and
`render.export` as needed.

Keep project data local. Never publish `.viora` project directories, media
files, credentials or machine-specific absolute paths. The current render
command creates an inspectable deterministic plan; do not claim that it has
rendered a video until the FFmpeg adapter has actually run.
