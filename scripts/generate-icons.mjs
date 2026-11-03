// Uygulama ikonlarını tek bir SVG tasarımından üretir: node scripts/generate-icons.mjs
import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const SPARKLE = 'M0 -1 C0.1 -0.38 0.38 -0.1 1 0 C0.38 0.1 0.1 0.38 0 1 C-0.1 0.38 -0.38 0.1 -1 0 C-0.38 -0.1 -0.1 -0.38 0 -1 Z'

/** scale: işaretin kenara göre büyüklüğü; rounded: köşe yuvarlatma (iOS kendi yuvarlattığı için kapalı) */
function svg({ scale, rounded }) {
  const r = rounded ? 112 : 0
  const big = 150 * scale
  const small = 52 * scale
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#C27A87"/>
      <stop offset="1" stop-color="#9E4D5E"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${r}" fill="url(#g)"/>
  <path d="${SPARKLE}" fill="#FFF8F7" transform="translate(${256 + 18 * scale} ${256 - 18 * scale}) scale(${big})"/>
  <path d="${SPARKLE}" fill="#FFF8F7" fill-opacity="0.85" transform="translate(${256 - 118 * scale} ${256 + 118 * scale}) scale(${small})"/>
</svg>`
}

const outputs = [
  { file: 'public/favicon.svg', svg: svg({ scale: 1, rounded: true }) },
  { file: 'public/icons/icon-192.png', size: 192, svg: svg({ scale: 1, rounded: true }) },
  { file: 'public/icons/icon-512.png', size: 512, svg: svg({ scale: 1, rounded: true }) },
  { file: 'public/icons/maskable-512.png', size: 512, svg: svg({ scale: 0.78, rounded: false }) },
  { file: 'public/icons/apple-touch-icon.png', size: 180, svg: svg({ scale: 0.9, rounded: false }) },
]

for (const { file, size, svg: source } of outputs) {
  if (!size) {
    await writeFile(file, source)
  } else {
    await sharp(Buffer.from(source)).resize(size, size).png().toFile(file)
  }
  console.log('yazıldı:', file)
}
