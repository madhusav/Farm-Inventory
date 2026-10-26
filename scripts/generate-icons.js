import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPNG(width, height, drawFn) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Standard filter
  ihdrData[12] = 0; // No interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcInput);

  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Draw a rich emerald icon with gold circular badge and goat/sheep horned emblem
function drawFlockIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Deep agricultural emerald green (#064E3B)
  const bgR = 6;
  const bgG = 78;
  const bgB = 59;

  if (isMaskable) {
    // Fill full bleed for maskable
    const circleRadius = w * 0.38;
    if (dist < circleRadius) {
      // Golden inner ring
      if (dist > circleRadius - 8) {
        return [234, 179, 8, 255]; // Amber border
      }
      // Inner badge light cream
      if (dist < circleRadius - 8) {
        // Center sheep/goat horn silhouette
        const ny = (y - cy) / (circleRadius - 8);
        const nx = (x - cx) / (circleRadius - 8);
        // Stylized head & horns shape
        if (ny > -0.2 && ny < 0.5 && Math.abs(nx) < 0.35 - ny * 0.2) {
          return [254, 243, 199, 255]; // Golden cream head
        }
        // Horn arches
        const hornDistL = Math.sqrt(Math.pow(nx + 0.35, 2) + Math.pow(ny + 0.25, 2));
        const hornDistR = Math.sqrt(Math.pow(nx - 0.35, 2) + Math.pow(ny + 0.25, 2));
        if ((hornDistL < 0.25 && hornDistL > 0.12 && ny < 0) || (hornDistR < 0.25 && hornDistR > 0.12 && ny < 0)) {
          return [245, 158, 11, 255]; // Amber horns
        }
        return [16, 185, 129, 255]; // Emerald core
      }
    }
    return [bgR, bgG, bgB, 255];
  } else {
    // Rounded squircle icon with transparent/dark background
    const cornerRadius = w * 0.22;
    // Check squircle bounds
    const inBox = Math.abs(dx) <= cx && Math.abs(dy) <= cy;
    const cornerDx = Math.max(0, Math.abs(dx) - (cx - cornerRadius));
    const cornerDy = Math.max(0, Math.abs(dy) - (cy - cornerRadius));
    const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);

    if (cornerDist > cornerRadius) {
      return [0, 0, 0, 0]; // Transparent outer
    }

    const circleRadius = w * 0.34;
    if (dist < circleRadius) {
      if (dist > circleRadius - 6) {
        return [234, 179, 8, 255]; // Gold ring
      }
      const ny = (y - cy) / circleRadius;
      const nx = (x - cx) / circleRadius;
      // Head
      if (ny > -0.15 && ny < 0.55 && Math.abs(nx) < 0.36 - ny * 0.2) {
        return [254, 243, 199, 255]; // Cream sheep/goat face
      }
      // Eyes
      if (ny > 0.05 && ny < 0.15 && Math.abs(Math.abs(nx) - 0.16) < 0.04) {
        return [6, 78, 59, 255]; // Emerald eye
      }
      // Curved Horns
      const hornDistL = Math.sqrt(Math.pow(nx + 0.32, 2) + Math.pow(ny + 0.22, 2));
      const hornDistR = Math.sqrt(Math.pow(nx - 0.32, 2) + Math.pow(ny + 0.22, 2));
      if ((hornDistL < 0.26 && hornDistL > 0.13 && ny < 0.05) || (hornDistR < 0.26 && hornDistR > 0.13 && ny < 0.05)) {
        return [245, 158, 11, 255]; // Gold horns
      }
      return [16, 185, 129, 255]; // Emerald inner
    }

    return [bgR, bgG, bgB, 255];
  }
}

// Ensure public dir exists
const publicDir = path.resolve('./public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate pwa-192x192.png
const pwa192 = createPNG(192, 192, (x, y, w, h) => drawFlockIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// 2. Generate pwa-512x512.png
const pwa512 = createPNG(512, 512, (x, y, w, h) => drawFlockIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// 3. Generate pwa-maskable-512x512.png
const pwaMaskable = createPNG(512, 512, (x, y, w, h) => drawFlockIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

// 4. Generate apple-touch-icon.png (180x180)
const appleIcon = createPNG(180, 180, (x, y, w, h) => drawFlockIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// 5. Generate icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#064E3B" />
  <circle cx="256" cy="256" r="180" fill="#10B981" stroke="#FBBF24" stroke-width="14" />
  <!-- Horns -->
  <path d="M 170 230 C 120 160, 140 100, 210 130 C 180 150, 175 180, 195 210 Z" fill="#F59E0B" />
  <path d="M 342 230 C 392 160, 372 100, 302 130 C 332 150, 337 180, 317 210 Z" fill="#F59E0B" />
  <!-- Face -->
  <polygon points="256,360 195,210 317,210" fill="#FEF3C7" />
  <circle cx="225" cy="245" r="10" fill="#064E3B" />
  <circle cx="287" cy="245" r="10" fill="#064E3B" />
  <ellipse cx="256" cy="330" rx="16" ry="8" fill="#D97706" />
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated all PWA icons in /public:');
console.log('- pwa-192x192.png');
console.log('- pwa-512x512.png');
console.log('- pwa-maskable-512x512.png');
console.log('- apple-touch-icon.png');
console.log('- icon.svg');
