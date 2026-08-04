# ADR 0003: Proposal-first agent editing

Status: Accepted

Agent edits are represented as typed proposals before project mutation. This keeps EVA understandable, reviewable, and reversible while preserving Codex/MCP automation.

The session binds project identity and revision. Approval is explicit in manual mode and opt-in in auto mode. Applying a proposal uses the same SRK command path as direct edits, so the timeline has one consistent source of truth and event log.

We adopt the workflow pattern, not upstream branding, source code, identifiers, or visual identity.
