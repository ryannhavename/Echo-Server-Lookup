const fs = require('fs');
const path = require('path');

// Use sharp from node_modules
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Sharp not found, please run: bun install');
  process.exit(1);
}

const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');

const sizes = [16, 32, 48, 64];

async function generateFavicon() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Convert SVG to PNG at each size
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // ICO format: header (6 bytes) + entries (16 bytes each) + PNG data
  const entries = [];
  let imageDataOffset = 6 + 16 * sizes.length;

  const imageBuffersWithOffset = [];

  for (let i = 0; i < sizes.length; i++) {
    const pngBuffer = pngBuffers[i];
    const size = sizes[i];

    // ICO directory entry
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size; // width (0 = 256)
    entry[1] = size >= 256 ? 0 : size; // height (0 = 256)
    entry[2] = 0; // color palette
    entry[3] = 0; // reserved
    entry[4] = 1; // color planes
    entry[5] = 0;
    entry[6] = 32; // bits per pixel
    entry[7] = 0;
    entry.writeUInt32LE(pngBuffer.length, 8); // size
    entry.writeUInt32LE(imageDataOffset, 12); // offset

    entries.push(entry);
    imageBuffersWithOffset.push({ buffer: pngBuffer, offset: imageDataOffset });
    imageDataOffset += pngBuffer.length;
  }

  // Build ICO file
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: ICO
  header.writeUInt16LE(sizes.length, 4); // number of images

  const icoBuffer = Buffer.concat([
    header,
    ...entries,
    ...imageBuffersWithOffset.map(item => item.buffer),
  ]);

  fs.writeFileSync(icoPath, icoBuffer);
  console.log('✅ favicon.ico generated successfully at:', icoPath);
}

generateFavicon().catch(console.error);
