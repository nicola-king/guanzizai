#!/usr/bin/env node
import { dispatch } from "../../../packages/srk-runtime/runtime.mjs";
const args = process.argv.slice(2);
const media = args.find((x) => !x.startsWith("--"));
const flag = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] || fallback : fallback; };
if (!media || args.includes("--help")) { console.log("Usage: node apps/studio-desktop/bin/viora-quick.mjs <media> [--project .viora] [--duration 5] [--output ./renders/output.mp4]"); process.exit(media ? 0 : 2); }
const projectPath = flag("project", ".viora");
try {
  const project = await dispatch({ name: "project.create", projectPath, projectName: "Viora Project" });
  const asset = await dispatch({ name: "media.import", projectPath, path: media });
  const clip = await dispatch({ name: "timeline.clip.add", projectPath, trackId: "v1", assetId: asset.id, start: 0, duration: Number(flag("duration", "5")) });
  const output = flag("output", null);
  const plan = output ? await dispatch({ name: "render.export", projectPath, outputPath: output }) : null;
  console.log(JSON.stringify({ project: project.path, asset: asset.id, clip: clip.id, exportPlan: plan?.outputPath || null }, null, 2));
} catch (error) { console.error(JSON.stringify({ error: error.message })); process.exit(1); }