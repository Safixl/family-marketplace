import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const iconsDir = path.join(publicDir, 'icons');
const splashDir = path.join(publicDir, 'splash');
const sourceSvg = path.join(publicDir, 'icon.svg');
const markSvg = path.join(publicDir, 'icon-mark.svg');

const THEME_BG = '#14100c';

/** Обычные иконки: размер стороны в px. */
const ICON_SIZES = [
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 1024, name: 'icon-1024.png' },
  { size: 32, name: 'favicon-32.png' },
];

/** Maskable-иконки: логотип занимает ~78% площади, вокруг безопасный отступ. */
const MASKABLE_SIZES = [
  { size: 192, name: 'maskable-192.png' },
  { size: 512, name: 'maskable-512.png' },
];

/** iPhone 12+ и новее: CSS-размеры и device pixel ratio. */
const IPHONES = [
  { name: 'iphone-12-mini', width: 375, height: 812, ratio: 3 },
  { name: 'iphone-12-13-14', width: 390, height: 844, ratio: 3 },
  { name: 'iphone-12-13-14-pro-max', width: 428, height: 926, ratio: 3 },
  { name: 'iphone-14-pro-15', width: 393, height: 852, ratio: 3 },
  { name: 'iphone-15-pro-max', width: 430, height: 932, ratio: 3 },
  { name: 'iphone-16-pro', width: 402, height: 874, ratio: 3 },
  { name: 'iphone-16-pro-max', width: 440, height: 956, ratio: 3 },
];

function splashSvg(width, height, iconSize) {
  const x = (width - iconSize) / 2;
  const y = (height - iconSize) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="#2a2118" />
      <stop offset="55%" stop-color="#17120d" />
      <stop offset="100%" stop-color="#0c0a07" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#d97706" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.max(width, height) * 0.34}" fill="url(#glow)" />
  <image href="data:image/png;base64,__ICON__" x="${x}" y="${y}" width="${iconSize}" height="${iconSize}" />
</svg>`;
}

async function main() {
  await mkdir(iconsDir, { recursive: true });
  await mkdir(splashDir, { recursive: true });

  const svg = await readFile(sourceSvg);
  const mark = await readFile(markSvg);

  for (const { size, name } of ICON_SIZES) {
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(iconsDir, name));
  }

  for (const { size, name } of MASKABLE_SIZES) {
    const inner = Math.round(size * 0.78);
    const logo = await sharp(mark, { density: 384 }).resize(inner, inner, { fit: 'contain' }).png().toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: THEME_BG },
    })
      .composite([{ input: logo, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(iconsDir, name));
  }

  // Прозрачная эмблема для splash-экранов — без тёмного квадрата вокруг.
  const splashIcon = await sharp(mark, { density: 384 }).resize(320, 320, { fit: 'contain' }).png().toBuffer();
  const splashIconBase64 = splashIcon.toString('base64');

  for (const device of IPHONES) {
    const orientations = [
      { suffix: 'portrait', width: device.width, height: device.height },
      { suffix: 'landscape', width: device.height, height: device.width },
    ];
    for (const orientation of orientations) {
      const pixelWidth = orientation.width * device.ratio;
      const pixelHeight = orientation.height * device.ratio;
      const iconSize = Math.round(Math.min(pixelWidth, pixelHeight) * 0.28);
      const markup = splashSvg(pixelWidth, pixelHeight, iconSize).replace('__ICON__', splashIconBase64);
      const fileName = `${device.name}-${orientation.suffix}-${pixelWidth}x${pixelHeight}.png`;
      await sharp(Buffer.from(markup)).png({ compressionLevel: 9 }).toFile(path.join(splashDir, fileName));
    }
  }

  // Копия SVG для <link rel="icon"> — уже лежит в public, но фиксируем наличие.
  await writeFile(path.join(publicDir, 'icon.svg'), svg);

  console.log(`PWA icons generated in ${iconsDir}`);
  console.log(`iOS splash screens generated in ${splashDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
