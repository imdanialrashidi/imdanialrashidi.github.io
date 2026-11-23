#!/usr/bin/env node
// Generates the raster app icons from the vector mark. Committed output: the
// build itself never needs sharp for icons. Run: npm run icons
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')

const mark = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="10" fill="#191612"/>
  <text x="31" y="46" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="32" fill="#f6f2ea" text-anchor="middle">DR</text>
  <circle cx="53" cy="12" r="4" fill="#b8320c"/>
</svg>`

async function write(relative, size) {
  const out = path.join(publicDir, relative)
  await sharp(Buffer.from(mark(size)))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log(`wrote ${relative} (${Math.round(fs.statSync(out).size / 1024)}K)`)
}

fs.mkdirSync(path.join(publicDir, 'icons'), { recursive: true })
await write('apple-touch-icon.png', 180)
await write('icons/icon-192.png', 192)
await write('icons/icon-512.png', 512)
