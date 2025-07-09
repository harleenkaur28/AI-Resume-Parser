import { mkdirSync, existsSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import sharp from 'sharp';

const appDir = join(process.cwd(), 'app');
const publicIconsDir = join(process.cwd(), 'public', 'icons');
const sourceSvg = join(appDir, 'icon.svg');

const targets = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'dashboard.png', size: 192 },
  { name: 'cold-mail.png', size: 192 },
  { name: 'hiring.png', size: 192 },
];

if (!existsSync(publicIconsDir)) {
  mkdirSync(publicIconsDir, { recursive: true });
}

async function generateMainIcons() {
  if (!existsSync(sourceSvg)) {
    console.error('No source icon found at /app/icon.svg');
    process.exit(1);
  }
  for (const target of targets) {
    const outPath = join(publicIconsDir, target.name);
    try {
      await sharp(sourceSvg)
        .resize(target.size, target.size)
        .png()
        .toFile(outPath);
      console.log(`Generated ${outPath}`);
    } catch (err) {
      console.error(`Failed to generate ${target.name}:`, err);
    }
  }
}

async function convertAllAppSVGs() {
  const files = readdirSync(appDir);
  for (const file of files) {
    if (extname(file) === '.svg') {
      const svgPath = join(appDir, file);
      const pngName = basename(file, '.svg') + '-192x192.png';
      const outPath = join(publicIconsDir, pngName);
      try {
        await sharp(svgPath)
          .resize(192, 192)
          .png()
          .toFile(outPath);
        console.log(`Converted ${file} to ${outPath}`);
      } catch (err) {
        console.error(`Failed to convert ${file}:`, err);
      }
    }
  }
}

(async () => {
  await generateMainIcons();
  await convertAllAppSVGs();
})(); 