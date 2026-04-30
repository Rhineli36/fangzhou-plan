import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const characterDir = path.join(root, "src", "data", "characters");
const publicRoot = path.join(root, "public");
const resourceRoot = path.join(publicRoot, "resources", "characters");

const mimeExt = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

function sanitizeSegment(value) {
  return String(value)
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "asset";
}

function fileNameForPath(parts, mime) {
  const ext = mimeExt[mime] ?? mime.split("/").pop() ?? "bin";
  const name = parts.map(sanitizeSegment).filter(Boolean).join("_") || "asset";
  return `${name}.${ext}`;
}

function extractDataUrl(dataUrl, outputFile) {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) return false;
  const [, mime, payload] = match;
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, Buffer.from(payload, "base64"));
  return mime;
}

function visit(value, context) {
  if (typeof value === "string") {
    const match = value.match(/^data:([^;,]+);base64,/);
    if (!match || !match[1].startsWith("image/")) return value;

    const mime = match[1];
    const fileName = fileNameForPath(context.pathParts, mime);
    const outputFile = path.join(resourceRoot, context.characterSlug, fileName);
    const writtenMime = extractDataUrl(value, outputFile);
    if (!writtenMime) return value;

    context.stats.count += 1;
    return `resources/characters/${context.characterSlug}/${fileName}`;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => visit(item, { ...context, pathParts: [...context.pathParts, String(index)] }));
  }

  if (value && typeof value === "object") {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = visit(item, { ...context, pathParts: [...context.pathParts, key] });
    }
    return next;
  }

  return value;
}

const files = fs.readdirSync(characterDir)
  .filter(file => file.endsWith(".json"))
  .sort();

let total = 0;
for (const file of files) {
  const fullPath = path.join(characterDir, file);
  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  const json = JSON.parse(raw);
  const characterSlug = sanitizeSegment(json?.creator?.studentId || json?.character?.id || file);
  const context = { characterSlug, pathParts: [], stats: { count: 0 } };
  const nextJson = visit(json, context);

  if (context.stats.count > 0) {
    fs.writeFileSync(fullPath, `${JSON.stringify(nextJson, null, 2)}\n`, "utf8");
    total += context.stats.count;
    console.log(`${file}: extracted ${context.stats.count} image(s)`);
  }
}

console.log(`Done. Extracted ${total} image(s).`);
