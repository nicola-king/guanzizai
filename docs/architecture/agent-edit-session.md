# Agent Edit Session

Viora uses a proposal-first editing workflow. EVA begins a session bound to one local project and its current revision, proposes typed SRK commands, and waits for review before mutation.

Flow: begin session → propose commands → inspect proposal → approve or reject → atomically apply → write an auditable event group.

Invariants:
- A session is bound to one project identity and base revision.
- A changed revision makes the session stale and requires a new proposal.
- Manual mode never mutates on proposal; auto mode is explicit policy.
- Commands use Viora/SRK contracts and remain locally inspectable.
- Export and generation are never hidden side effects.
