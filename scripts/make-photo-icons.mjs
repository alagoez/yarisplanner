// Arka planı kaldırılmış bir portreden (şeffaf PNG) ana ekran ikonları üretir:
//   node scripts/make-photo-icons.mjs <kesilmiş-portre.png> <üstY> <altY>
// üstY / altY: portrede ikona girecek dikey aralık (saçın biraz üstünden omuzlara kadar).
// Zemin uygulamanın pembe paletinden; köşelerde logodaki el çizimi yıldızlar var.
import sharp from 'sharp'

const [input, topArg, bottomArg] = process.argv.slice(2)
if (!input) {
  console.error('Kullanım: node scripts/make-photo-icons.mjs <kesilmiş-portre.png> <üstY> <altY>')
  process.exit(1)
}

const meta = await sharp(input).metadata()
const top = Number(topArg ?? 0)
const bottom = Number(bottomArg ?? meta.height)

// Kenardaki ince açık hareyi temizlemek için şeffaflık maskesi biraz daraltılır (yarı saydam kenarlar kısılır).
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 3; i < data.length; i += 4) data[i] = Math.max(0, Math.min(255, (data[i] - 80) * 1.45))
const cropH = bottom - top

// Omuzlar fotoğraf kenarında düz kesiliyor: alt kısımda yanları ve alt kenarı yumuşakça erit.
const fade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${cropH}">
  <defs>
    <radialGradient id="r" cx="50%" cy="38%" r="62%">
      <stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#r)"/>
</svg>`)

const cropped = await sharp(data, { raw: info }).extract({ left: 0, top, width: meta.width, height: cropH }).png().toBuffer()
const person = await sharp(cropped).composite([{ input: fade, blend: 'dest-in' }]).png().toBuffer()

const SPARKLE = 'M19 3c.6 5.6 2.4 7.4 9 8-6.6.6-8.4 2.4-9 8-.6-5.6-2.4-7.4-9-8 6.6-.6 8.4-2.4 9-8Z'

function background(size) {
  const star = (x, y, s, fill) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="${SPARKLE}" transform="translate(1.2 1.4)" fill="${fill}"/><path d="${SPARKLE}" fill="none" stroke="#5B3A42" stroke-width="1.4" stroke-linejoin="round"/></g>`
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
    <defs>
      <radialGradient id="bg" cx="50%" cy="38%" r="75%">
        <stop offset="0" stop-color="#FDEFF1"/>
        <stop offset=".55" stop-color="#F7C6CE"/>
        <stop offset="1" stop-color="#E9A3AE"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)"/>
    <circle cx="512" cy="455" r="330" fill="#FFF7F5" opacity=".55"/>
    ${star(70, 70, 5.2, '#F9E2A0')}
    ${star(820, 120, 3.2, '#FFF3E4')}
    ${star(860, 600, 2.4, '#F9E2A0')}
  </svg>`)
}

/** scale: portrenin ikon yüksekliğine oranı (kenarlara ne kadar yaklaşacağı) */
async function icon(scale) {
  const S = 1024
  const h = Math.round(S * scale)
  const w = Math.round(((meta.width / (bottom - top)) * h))
  const resized = await sharp(person).resize(w, h).toBuffer()
  return sharp(background(S))
    .composite([{ input: resized, left: Math.round((S - w) / 2), top: S - h }])
    .png()
    .toBuffer()
}

// Normal: baş ikonu doldurur. Maskable (Android yuvarlak kırpma): biraz daha küçük.
const normal = await icon(0.9)
const small = await icon(0.78)

const outputs = [
  { file: 'public/icons/apple-touch-icon.png', size: 180, src: normal },
  { file: 'public/icons/icon-192.png', size: 192, src: normal },
  { file: 'public/icons/icon-512.png', size: 512, src: normal },
  { file: 'public/icons/maskable-512.png', size: 512, src: small },
]

for (const { file, size, src } of outputs) {
  await sharp(src).resize(size, size).flatten({ background: '#f7c6ce' }).png({ compressionLevel: 9 }).toFile(file)
  console.log('yazıldı:', file)
}
