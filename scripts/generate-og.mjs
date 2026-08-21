#!/usr/bin/env node
// Generates public/og-default.png (1200x630) — brand-consistent social
// preview for the whole site. Re-run whenever branding changes; commit output.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="100%" height="100%" fill="#fcfcfc"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="#0f4cff"/>
  <text x="80" y="240" font-family="'Geist','DejaVu Sans',Arial,sans-serif"
        font-size="88" font-weight="700" letter-spacing="-2" fill="#0f1419">Danial Rashidi</text>
  <text x="80" y="330" font-family="'DejaVu Sans Mono','Menlo',monospace"
        font-size="34" fill="#5f6368">Software &amp; Product Builder</text>
  <text x="80" y="410" font-family="'DejaVu Sans',Arial,sans-serif"
        font-size="30" fill="#8a8f98">Web · AI · Automation · Product Engineering</text>
  <text x="80" y="540" font-family="'DejaVu Sans Mono','Menlo',monospace"
        font-size="26" fill="#0f4cff">imdanialrashidi.github.io</text>
</svg>`;

await mkdir(path.resolve("public"), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.resolve("public/og-default.png"));
console.log("wrote public/og-default.png");
