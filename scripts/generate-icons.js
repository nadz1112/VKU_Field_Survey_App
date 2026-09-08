import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icons/icon.svg');
const outDir = path.resolve('public/icons');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  // Maskable 512x512 (with padding)
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#003366'
    })
    .png()
    .toFile(path.join(outDir, 'icon-maskable.png'));
  console.log('Created icon-maskable.png');

  // Favicon (64x64 PNG and copy to public/favicon.ico)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.resolve('public/favicon.png'));
  
  fs.copyFileSync(path.resolve('public/favicon.png'), path.resolve('public/favicon.ico'));
  console.log('Created favicon.ico & favicon.png');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
