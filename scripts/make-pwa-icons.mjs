#!/usr/bin/env node
/**
 * Generate Eventra Business PWA icons as real PNGs (Bloque 16) — no external deps,
 * no rasterizer, no logos from other projects. Draws Eventra's own mark: an indigo
 * full-bleed field (maskable-safe) with a white calendar body inside the safe zone.
 * Outputs 192 + 512 (+ apple-touch 180) to apps/business/public/icons/.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "apps", "business", "public", "icons");
mkdirSync(outDir, { recursive: true });

// ── CRC32 (PNG chunk checksum) ──
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "latin1");
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(CRC(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  // 10,11,12 = compression/filter/interlace = 0
  // scanlines with filter byte 0
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const COLORS = {
  bg: [79, 70, 229, 255], // indigo #4f46e5
  body: [255, 255, 255, 255],
  head: [199, 210, 254, 255], // #c7d2fe
  tab: [49, 46, 129, 255], // #312e81
};

function draw(size) {
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b, a]) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a;
  };
  // background (full bleed → maskable safe)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) set(x, y, COLORS.bg);

  // calendar body within the central safe zone
  const bx0 = Math.round(size * 0.24), bx1 = Math.round(size * 0.76);
  const by0 = Math.round(size * 0.30), by1 = Math.round(size * 0.74);
  const r = Math.round(size * 0.05);
  const inRounded = (x, y) => {
    if (x < bx0 || x > bx1 || y < by0 || y > by1) return false;
    const cx = x < bx0 + r ? bx0 + r : x > bx1 - r ? bx1 - r : x;
    const cy = y < by0 + r ? by0 + r : y > by1 - r ? by1 - r : y;
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r || (x >= bx0 + r && x <= bx1 - r) || (y >= by0 + r && y <= by1 - r);
  };
  const headEnd = by0 + Math.round((by1 - by0) * 0.24);
  for (let y = by0; y <= by1; y++)
    for (let x = bx0; x <= bx1; x++)
      if (inRounded(x, y)) set(x, y, y <= headEnd ? COLORS.head : COLORS.body);

  // two binder tabs above the body
  const tabW = Math.round(size * 0.03), tabH = Math.round(size * 0.09);
  for (const fx of [0.36, 0.60]) {
    const tx = Math.round(size * fx);
    for (let y = by0 - tabH; y < by0 + tabH * 0.4; y++)
      for (let x = tx; x < tx + tabW; x++) set(x, y, COLORS.tab);
  }
  return px;
}

for (const size of [192, 512, 180]) {
  const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  writeFileSync(join(outDir, name), encodePng(size, draw(size)));
  console.log(`  ✓ wrote icons/${name} (${size}x${size})`);
}
console.log("PWA icons generated.");
