import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const readProject = async (root) => JSON.parse(await readFile(resolve(root, "project.json"), "utf8"));
const saveProject = async (root, project, event) => {
  await mkdir(root, { recursive: true });
  await writeFile(resolve(root, "project.json"), JSON.stringify(project, null, 2) + "\n", "utf8");
  if (event) await appendFile(resolve(root, "events.jsonl"), JSON.stringify(event) + "\n", "utf8");
};
const ensureProject = async (root, name = "Viora Project") => {
  try { return await readProject(root); } catch {
    const project = { schemaVersion: 1, id: id("project"), name, revision: 0, timeline: { tracks: [{ id: "v1", kind: "video", clips: [] }] }, assets: [], updatedAt: now() };
    await saveProject(root, project, { schemaVersion: 1, id: id("event"), projectId: project.id, revision: 0, name: "project.created", occurredAt: project.updatedAt, data: {} });
    return project;
  }
};

export async function dispatch(command) {
  const root = resolve(command.projectPath || ".viora");
  let project = await ensureProject(root, command.name);
  const event = (name, data, revision) => ({ schemaVersion: 1, id: id("event"), projectId: project.id, revision, name, occurredAt: now(), data });
  if (command.name === "project.create") {
    project = await ensureProject(root, command.projectName || "Viora Project");
    return { projectId: project.id, revision: project.revision, path: root };
  }
  if (command.name === "project.inspect") return project;
  if (command.name === "media.import") {
    const asset = { id: id("asset"), path: resolve(command.path), kind: command.kind || "video" };
    project = { ...project, revision: project.revision + 1, assets: [...project.assets, asset], updatedAt: now() };
    await saveProject(root, project, event(command.name, asset, project.revision));
    return asset;
  }
  if (command.name === "timeline.clip.add") {
    const track = project.timeline.tracks.find((item) => item.id === command.trackId);
    if (!track) throw new Error(`track not found: ${command.trackId}`);
    const assetId = command.assetId || project.assets.at(-1)?.id;
    if (!assetId) throw new Error("no asset available; import media first");
    const clip = { id: command.clipId || id("clip"), assetId, start: command.start || 0, duration: command.duration };
    if (!(clip.duration > 0) || clip.start < 0) throw new Error("start must be non-negative and duration must be positive");
    if (track.clips.some((x) => x.start < clip.start + clip.duration && clip.start < x.start + x.duration)) throw new Error("clip overlaps an existing clip");
    const nextTrack = { ...track, clips: [...track.clips, clip].sort((a, b) => a.start - b.start) };
    project = { ...project, revision: project.revision + 1, timeline: { ...project.timeline, tracks: project.timeline.tracks.map((x) => x.id === track.id ? nextTrack : x) }, updatedAt: now() };
    await saveProject(root, project, event(command.name, clip, project.revision));
    return clip;
  }
  if (command.name === "timeline.inspect") return project.timeline;
  if (command.name === "render.export") {
    const recipe = command.recipe || { container: "mp4", videoCodec: "libx264", audioCodec: "aac", width: 1920, height: 1080, frameRate: 30 };
    const manifest = { schemaVersion: 1, projectId: project.id, revision: project.revision, outputPath: resolve(command.outputPath), recipe, createdAt: now() };
    await mkdir(dirname(manifest.outputPath), { recursive: true });
    const digest = createHash("sha256").update(JSON.stringify(manifest)).digest("hex");
    await writeFile(`${manifest.outputPath}.viora-render.json`, JSON.stringify({ ...manifest, planHash: digest }, null, 2) + "\n", "utf8");
    return { status: "planned", ...manifest, planHash: digest, note: "FFmpeg execution is the next adapter step; this plan is deterministic and inspectable." };
  }
  throw new Error(`unknown command: ${command.name}`);
}
