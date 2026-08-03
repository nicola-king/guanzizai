#!/usr/bin/env node
import { dispatch } from "../../../packages/srk-runtime/runtime.mjs";

const args = process.argv.slice(2);
const [group, action, ...rest] = args;
const flags = {};
for (let i = 0; i < rest.length; i += 1) {
  if (!rest[i].startsWith("--")) continue;
  const key = rest[i].slice(2);
  const next = rest[i + 1];
  flags[key] = next && !next.startsWith("--") ? next : true;
  if (flags[key] !== true) i += 1;
}
const projectPath = flags.project || ".viora";
const command = group === "project" && action === "create" ? { name: "project.create", projectPath, projectName: flags.name } :
  group === "project" && action === "inspect" ? { name: "project.inspect", projectPath } :
  group === "media" && action === "import" ? { name: "media.import", projectPath, path: flags.path || rest.find((x) => !x.startsWith("--")), kind: flags.kind } :
  group === "timeline" && action === "add" ? { name: "timeline.clip.add", projectPath, trackId: flags.track || "v1", assetId: flags.asset || undefined, clipId: flags.clip, start: Number(flags.start || 0), duration: Number(flags.duration) } :
  group === "timeline" && action === "inspect" ? { name: "timeline.inspect", projectPath } :
  group === "render" && action === "export" ? { name: "render.export", projectPath, outputPath: flags.output || "./renders/output.mp4" } : null;
if (!command) { console.error("Usage: viora project create|inspect, media import, timeline add|inspect, render export"); process.exit(2); }
try { console.log(JSON.stringify(await dispatch(command), null, 2)); } catch (error) { console.error(JSON.stringify({ error: error.message })); process.exit(1); }