#!/usr/bin/env node
import readline from "node:readline";
import { dispatch } from "../../../packages/srk-runtime/runtime.mjs";

const tools = [  { name: "edit_session.begin", description: "Start a revision-bound Viora agent editing session.", inputSchema: { type: "object", properties: { projectPath: { type: "string" }, approvalMode: { type: "string", enum: ["manual", "auto"] } }, required: ["projectPath"] } },
  { name: "edit_session.propose", description: "Create a typed, reviewable edit proposal without mutating the project.", inputSchema: { type: "object", properties: { sessionId: { type: "string" }, intent: { type: "string" }, explanation: { type: "string" }, commands: { type: "array", items: { type: "object" } } }, required: ["sessionId", "commands"] } },
  { name: "edit_session.review", description: "Approve or reject a pending Viora edit proposal atomically.", inputSchema: { type: "object", properties: { sessionId: { type: "string" }, approve: { type: "boolean" } }, required: ["sessionId", "approve"] } },
  { name: "edit_session.discard", description: "Discard a draft Viora editing session.", inputSchema: { type: "object", properties: { sessionId: { type: "string" } }, required: ["sessionId"] } },
  { name: "project.create", description: "Create or open a local Viora project.", inputSchema: { type: "object", properties: { projectPath: { type: "string" }, projectName: { type: "string" } }, required: ["projectPath"] } },
  { name: "project.inspect", description: "Inspect the local Viora project snapshot.", inputSchema: { type: "object", properties: { projectPath: { type: "string" } }, required: ["projectPath"] } },
  { name: "media.import", description: "Register a local media file as a Viora asset.", inputSchema: { type: "object", properties: { projectPath: { type: "string" }, path: { type: "string" }, kind: { type: "string", enum: ["video", "audio", "image"] } }, required: ["projectPath", "path"] } },
  { name: "timeline.clip.add", description: "Add a non-overlapping clip to a Viora timeline track.", inputSchema: { type: "object", properties: { projectPath: { type: "string" }, trackId: { type: "string" }, assetId: { type: "string" }, clipId: { type: "string" }, start: { type: "number", minimum: 0 }, duration: { type: "number", exclusiveMinimum: 0 } }, required: ["projectPath", "trackId", "assetId", "duration"] } },
  { name: "timeline.inspect", description: "Inspect the semantic Viora timeline.", inputSchema: { type: "object", properties: { projectPath: { type: "string" } }, required: ["projectPath"] } },
  { name: "render.export", description: "Create a deterministic, inspectable Viora render plan.", inputSchema: { type: "object", properties: { projectPath: { type: "string" }, outputPath: { type: "string" } }, required: ["projectPath", "outputPath"] } }
];

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
const send = (message) => process.stdout.write(JSON.stringify(message) + "\n");
const result = (id, value) => send({ jsonrpc: "2.0", id, result: value });
const failure = (id, error) => send({ jsonrpc: "2.0", id, error: { code: -32000, message: error.message } });

for await (const line of rl) {
  if (!line.trim()) continue;
  try {
    const request = JSON.parse(line);
    if (request.method === "initialize") result(request.id, { protocolVersion: "2024-11-05", serverInfo: { name: "viora-ai-studio", version: "0.1.0" }, capabilities: { tools: {} } });
    else if (request.method === "notifications/initialized") continue;
    else if (request.method === "tools/list") result(request.id, { tools });
    else if (request.method === "tools/call") {
      const value = await dispatch({ name: request.params.name, ...(request.params.arguments || {}) });
      result(request.id, { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], isError: false });
    } else if (request.id !== undefined) result(request.id, {});
  } catch (error) { failure(null, error); }
}