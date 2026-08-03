import http from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dispatch } from "../../packages/srk-runtime/runtime.mjs";

const root = new URL("./ui/", import.meta.url);
const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/command") {
      let body = ""; for await (const chunk of req) body += chunk;
      const result = await dispatch(JSON.parse(body));
      res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(result)); return;
    }
    const file = req.url === "/" ? "index.html" : req.url.slice(1);
    const data = await readFile(new URL(file, root));
    res.writeHead(200, { "content-type": file.endsWith(".html") ? "text/html; charset=utf-8" : "text/plain" }); res.end(data);
  } catch (error) { res.writeHead(500, { "content-type": "application/json" }); res.end(JSON.stringify({ error: error.message })); }
});
const port = Number(process.env.VIORA_PORT || 4173);
server.listen(port, "127.0.0.1", () => console.log(`Viora UI: http://127.0.0.1:${port}`));
