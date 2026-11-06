import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import app from "./app.js";

// If the client is built, serve it too (for `npm start` on a normal server)
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
