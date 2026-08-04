import type { CommandEnvelope, ProjectId, ProjectRevision } from "@viora/contracts";

export type ApprovalMode = "manual" | "auto";
export type EditSessionStatus = "drafting" | "awaiting-approval" | "applied" | "rejected" | "stale" | "discarded";

export interface EditSessionBinding {
  readonly sessionId: string;
  readonly projectId: ProjectId;
  readonly baseRevision: ProjectRevision;
  readonly approvalMode: ApprovalMode;
}

export interface EditProposal {
  readonly binding: EditSessionBinding;
  readonly intent: string;
  readonly commands: readonly CommandEnvelope[];
  readonly status: EditSessionStatus;
  readonly createdAt: string;
  readonly explanation: readonly string[];
}

export interface EditSessionController {
  begin(projectId: ProjectId, baseRevision: ProjectRevision, mode?: ApprovalMode): Promise<EditSessionBinding>;
  propose(sessionId: string, intent: string, commands: readonly CommandEnvelope[]): Promise<EditProposal>;
  review(sessionId: string, approve: boolean): Promise<EditProposal>;
  discard(sessionId: string): Promise<void>;
}
