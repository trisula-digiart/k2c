const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(2, 9); // color type 2 (truecolor)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);

    // CRC32
    let c = 0xffffffff;
    for (let i = 4; i < 8 + len; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    buf.writeInt32BE(~c, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with scanline filter bytes
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Simple border/gradient design
      const isBorder = x < 8 || x > width - 9 || y < 8 || y > height - 9;
      if (isBorder) {
        rawData[pixelOffset] = 59; // Blue accent
        rawData[pixelOffset + 1] = 130;
        rawData[pixelOffset + 2] = 246;
      } else {
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create 192x192 and 512x512 dark themed icons (#0f172a)
const png192 = createPNG(192, 192, 15, 23, 42);
const png512 = createPNG(512, 512, 15, 23, 42);

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);

// Also create an SVG version for high fidelity displays
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <rect x="24" y="24" width="464" height="464" rx="72" fill="none" stroke="#3b82f6" stroke-width="12"/>
  <text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="900" font-size="120">K2C</text>
  <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="700" font-size="44">KOMPUTINDO</text>
  <text x="50%" y="76%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-weight="500" font-size="28">QC &amp; POS HUB</text>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svg);

console.log('Icons generated successfully!');
