// El çizimi tarzındaki uygulama illüstrasyonlarını üretir: node scripts/draw-art.mjs
// Her nesne iki kez çizilir: hafif kaydırılmış pastel dolgu + titrek mürekkep çizgisi.
import { writeFile } from 'node:fs/promises'

const INK = '#5B3A42'
const C = {
  pink: '#F7C6CE',
  petal: '#FADBE0',
  rose: '#EBA1AD',
  berry: '#D97C8C',
  blush: '#F2A0AE',
  cream: '#FFF3E4',
  white: '#FFFDFB',
  butter: '#F9E2A0',
  orange: '#F4B07A',
  tomato: '#EC8C86',
  sage: '#BCD4A9',
  leaf: '#93B884',
  lavender: '#DED3EF',
  lilac: '#C2B1DF',
  sky: '#D6E8F4',
  bread: '#E8B57E',
  plum: '#7A5363',
  coffee: '#C9926B',
}

// ---------- şekil yardımcıları ----------
const path = (d) => `<path d="${d}"/>`
const circle = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`
const ellipse = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`
const rect = (x, y, w, h, r = 4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`

/** Dolgulu ve çizgili nesne */
const shape = (el, fill, extra = {}) => ({ el, fill, outline: true, ...extra })
/** Yalnızca çizgi (buhar, damar, sap) */
const line = (d, extra = {}) => ({ el: path(d), outline: true, ...extra })
/** Kaydırmasız küçük ayrıntı (göz, yanak, nokta) */
const dot = (el, color, extra = {}) => ({ el, solid: color, ...extra })

const r2 = (n) => Math.round(n * 10) / 10

/** Ortanca hortensia gibi tırtıklı daire */
function scallop(cx, cy, R, n = 8) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return [r2(cx + R * Math.cos(a)), r2(cy + R * Math.sin(a))]
  })
  const r = r2(R * 0.5)
  return `M${pts[0][0]} ${pts[0][1]}` + pts.map((_, i) => { const p = pts[(i + 1) % n]; return `A${r} ${r} 0 0 1 ${p[0]} ${p[1]}` }).join('') + 'Z'
}

const LEAF = 'M0 0C8 -9 20 -9 28 0C20 9 8 9 0 0Z'
const leaf = (x, y, angle, s = 1, fill = C.sage) => [
  shape(path(LEAF), fill, { t: `translate(${x} ${y}) rotate(${angle}) scale(${s})` }),
  line('M4 0H24', { t: `translate(${x} ${y}) rotate(${angle}) scale(${s})`, sw: 1.6, op: 0.6 }),
]

const HEART = 'M0 4C-7 -2 -3 -8 0 -4C3 -8 7 -2 0 4Z'
const heart = (x, y, s = 1, fill = C.rose) => shape(path(HEART), fill, { t: `translate(${x} ${y}) scale(${s})`, sw: 2 })

const SPARKLE = 'M0 -8C1 -2 2 -1 8 0C2 1 1 2 0 8C-1 2 -2 1 -8 0C-2 -1 -1 -2 0 -8Z'
const sparkle = (x, y, s = 1, fill = C.butter) => shape(path(SPARKLE), fill, { t: `translate(${x} ${y}) scale(${s})`, sw: 2 })

const sprinkle = (pts, color = C.rose) => pts.map(([x, y, r = 1.8]) => dot(circle(x, y, r), color))

/** Gülümseyen yüz: gözler, ağız, pembe yanaklar */
function face(cx, cy, s = 1) {
  return [
    dot(ellipse(cx - 11 * s, cy + 4 * s, 4.6 * s, 2.7 * s), C.blush, { op: 0.8 }),
    dot(ellipse(cx + 11 * s, cy + 4 * s, 4.6 * s, 2.7 * s), C.blush, { op: 0.8 }),
    dot(circle(cx - 6 * s, cy, 2.3 * s), INK),
    dot(circle(cx + 6 * s, cy, 2.3 * s), INK),
    line(`M${cx - 3.5 * s} ${cy + 4 * s}Q${cx} ${cy + 7.5 * s} ${cx + 3.5 * s} ${cy + 4 * s}`, { sw: 2 }),
  ]
}

const ground = (y, x1 = 16, x2 = 228) => line(`M${x1} ${y}C${x1 + 60} ${y + 3} ${x2 - 70} ${y - 3} ${x2} ${y + 1}`, { op: 0.3, sw: 2 })

/** Nesne grubunu taşı/büyüt */
const place = (shapes, x, y, s = 1) => shapes.flat().map((sh) => ({ ...sh, t: `translate(${x} ${y}) scale(${s})${sh.t ? ' ' + sh.t : ''}` }))

// ---------- nesneler ----------
function vaseWithFlowers() {
  return [
    line('M100 98C98 82 92 70 84 60', { stroke: C.leaf, sw: 2.6 }),
    line('M108 98C110 80 116 66 126 54', { stroke: C.leaf, sw: 2.6 }),
    line('M104 98C104 78 104 60 105 40', { stroke: C.leaf, sw: 2.6 }),
    leaf(98, 86, -150, 0.9),
    leaf(110, 80, -35, 0.9),
    leaf(104, 66, -125, 0.7, C.leaf),
    shape(path(scallop(84, 58, 22)), C.pink),
    shape(path(scallop(128, 52, 20)), C.petal),
    shape(path(scallop(106, 34, 21)), C.pink),
    sprinkle([[78, 52, 2.2], [90, 60, 2.2], [82, 66, 2.2], [122, 48, 2.2], [132, 56, 2.2], [100, 30, 2.2], [112, 38, 2.2], [104, 26, 2.2]], C.berry),
    shape(path('M72 118C68 150 76 172 96 174L120 174C140 172 148 150 144 118C142 106 136 100 130 98L86 98C80 100 74 106 72 118Z'), C.sky),
    line('M76 134C96 140 120 140 141 134', { op: 0.45, sw: 2 }),
    line('M84 108C80 120 80 140 86 152', { stroke: C.white, sw: 3, op: 0.9 }),
  ]
}

function cupOnBooks() {
  return [
    shape(rect(140, 152, 82, 17, 5), C.rose),
    line('M146 160H214', { op: 0.35, sw: 1.6 }),
    shape(rect(147, 137, 68, 15, 5), C.cream),
    line('M152 144H208', { op: 0.35, sw: 1.6 }),
    shape(ellipse(181, 135, 30, 5.5), C.white),
    line('M201 104C215 102 217 119 199 121', { sw: 3 }),
    shape(path('M157 98L205 98C205 120 197 132 181 132C165 132 157 120 157 98Z'), C.white),
    shape(ellipse(181, 98, 24, 5), C.coffee),
    face(181, 112),
    line('M172 89C166 83 178 79 172 71', { stroke: C.berry, sw: 2, op: 0.7 }),
    line('M188 87C182 81 194 77 188 69', { stroke: C.berry, sw: 2, op: 0.7 }),
    heart(198, 60, 1.2),
  ]
}

function booksStack() {
  return [
    shape(rect(0, 36, 104, 18, 5), C.lavender),
    line('M8 45H96', { op: 0.35, sw: 1.6 }),
    shape(rect(8, 18, 92, 18, 5), C.pink),
    line('M14 27H92', { op: 0.35, sw: 1.6 }),
    shape(path('M78 18V32L82 29L86 32V18'), C.berry, { sw: 1.8 }),
    shape(rect(4, 0, 96, 18, 5), C.cream),
    line('M10 9H94', { op: 0.35, sw: 1.6 }),
  ]
}

function gradCap() {
  return [
    shape(path('M20 18V28C28 35 56 35 64 28V18'), C.plum),
    shape(path('M42 0L84 12L42 24L0 12Z'), C.plum),
    line('M42 12L74 16V31', { stroke: C.butter, sw: 2.6, filterless: true }),
    shape(circle(74, 34, 3.6), C.butter, { sw: 1.8 }),
  ]
}

function pumpBottle() {
  return [
    line('M16 12V2H34V8', { sw: 2.6 }),
    shape(rect(12, 12, 16, 14, 3), C.white),
    shape(rect(0, 26, 40, 66, 12), C.pink),
    face(20, 44, 0.75),
    shape(rect(8, 62, 24, 20, 5), C.white, { sw: 2 }),
    heart(20, 72, 0.8),
    line('M6 34C4 46 4 64 6 76', { stroke: C.white, sw: 3, op: 0.9 }),
  ]
}

function jar() {
  return [
    shape(rect(2, 10, 40, 30, 9), C.lavender),
    shape(rect(0, 2, 44, 11, 4), C.rose),
    heart(22, 26, 0.9, C.white),
  ]
}

function candle() {
  return [
    shape(path('M15 8C10 2 14 -6 15 -12C16 -6 20 2 15 8Z'), C.butter, { sw: 2 }),
    line('M15 8V14', { sw: 2 }),
    shape(rect(0, 14, 30, 28, 7), C.white),
    shape(ellipse(15, 16, 13, 3), C.cream, { sw: 1.8 }),
    line('M5 26H25', { stroke: C.rose, sw: 2.4 }),
  ]
}

function towels() {
  return [
    shape(rect(0, 18, 76, 20, 9), C.pink),
    line('M8 30H68', { stroke: C.white, sw: 2.6 }),
    shape(rect(6, 0, 64, 19, 9), C.cream),
    line('M12 11H64', { stroke: C.rose, sw: 2.6 }),
  ]
}

function pastaBowl() {
  const penne = [
    [30, 14, -20], [46, 8, 15], [62, 12, -35], [78, 7, 25], [92, 14, -10], [54, 18, 40], [38, 22, 10], [72, 20, -15], [86, 22, 30],
  ]
  return [
    shape(path('M18 24C20 8 92 6 96 24Z'), C.tomato, { sw: 0 }),
    ...penne.map(([x, y, a]) => shape(rect(-8, -3.5, 16, 7, 3.5), C.orange, { t: `translate(${x} ${y}) rotate(${a})`, sw: 1.8 })),
    leaf(56, 4, -20, 0.55, C.leaf),
    leaf(60, 4, -160, 0.5, C.leaf),
    shape(path('M0 24H114C112 50 90 64 57 64C24 64 2 50 0 24Z'), C.white),
    face(57, 40, 0.9),
    line('M8 32C12 44 20 52 30 56', { stroke: C.pink, sw: 3, op: 0.9 }),
  ]
}

// ---------- illüstrasyonlar ----------
const ART = {
  'home-hero': {
    box: [240, 190],
    shapes: [
      ground(176),
      vaseWithFlowers(),
      cupOnBooks(),
      sparkle(34, 36),
      sparkle(222, 30, 0.75),
      sparkle(152, 22, 0.55, C.pink),
      sprinkle([[22, 72], [226, 96], [58, 18], [160, 78, 1.5]]),
    ],
  },
  'planner-hero': {
    box: [240, 190],
    shapes: [
      ground(176),
      place(vaseWithFlowers(), -22, 0),
      place(booksStack(), 128, 120),
      place(gradCap(), 140, 88),
      sparkle(218, 40, 0.8),
      sparkle(30, 30, 0.7),
      heart(206, 74, 1),
      sprinkle([[176, 30], [20, 80], [228, 110, 1.5]]),
    ],
  },
  'lists-hero': {
    box: [240, 190],
    shapes: [
      ground(178),
      place(vaseWithFlowers(), -34, 34, 0.78),
      place(towels(), 108, 136),
      place(pumpBottle(), 126, 44),
      place(candle(), 196, 136),
      sparkle(212, 40, 0.8),
      sparkle(92, 24, 0.6, C.pink),
      sprinkle([[180, 60], [232, 92], [100, 70, 1.5]]),
    ],
  },
  'dinner-hero': {
    box: [240, 190],
    shapes: [
      ground(170),
      place(vaseWithFlowers(), -36, 40, 0.75),
      place(pastaBowl(), 104, 96),
      line('M146 84C140 78 152 74 146 66', { stroke: C.berry, sw: 2, op: 0.7 }),
      line('M164 82C158 76 170 72 164 64', { stroke: C.berry, sw: 2, op: 0.7 }),
      heart(182, 56, 1.1),
      sparkle(220, 36, 0.8),
      sprinkle([[120, 50], [230, 92], [200, 70, 1.5]]),
    ],
  },
  laptop: {
    box: [160, 120],
    shapes: [
      ground(102, 10, 150),
      shape(rect(30, 18, 92, 62, 9), C.lavender),
      shape(rect(37, 25, 78, 48, 5), C.white, { sw: 2 }),
      heart(76, 48, 2.2),
      line('M46 36H62', { op: 0.4, sw: 2 }),
      line('M90 62H106', { op: 0.4, sw: 2 }),
      shape(path('M16 82H136C136 91 130 96 122 96H30C22 96 16 91 16 82Z'), C.lilac),
      line('M66 88H86', { sw: 2 }),
      leaf(138, 72, -115, 0.7),
      leaf(138, 72, -65, 0.7, C.leaf),
      leaf(138, 72, -90, 0.8),
      shape(path('M127 70H149L145 96H131Z'), C.rose),
      sparkle(18, 24, 0.75),
    ],
  },
  'books-cap': {
    box: [160, 130],
    shapes: [ground(116, 10, 150), place(booksStack(), 26, 60), place(gradCap(), 34, 30), sparkle(138, 28, 0.8), sprinkle([[22, 40], [146, 64, 1.5]])],
  },
  plate: {
    box: [170, 130],
    shapes: [
      shape(ellipse(84, 80, 66, 40), C.white),
      line('M40 82C42 64 66 52 84 52C104 52 128 64 130 82', { op: 0.25, sw: 2 }),
      shape(path('M46 84C46 68 72 62 84 72C92 64 110 68 108 84C98 94 58 96 46 84Z'), C.butter, { sw: 2 }),
      sprinkle([[60, 80, 1.2], [70, 76, 1.2], [80, 82, 1.2], [92, 78, 1.2], [100, 82, 1.2], [66, 86, 1.2], [88, 88, 1.2]], INK),
      line('M126 58L136 50', { sw: 3 }),
      shape(circle(139, 47, 4), C.cream, { sw: 2 }),
      shape(path('M98 62C106 52 124 54 126 66C128 78 114 84 104 78Z'), C.bread),
      shape(circle(116, 94, 8), C.tomato),
      sparkle(116, 87, 0.45, C.leaf),
      shape(circle(70, 100, 6.5), C.orange, { sw: 2 }),
      shape(circle(86, 103, 6.5), C.orange, { sw: 2 }),
      shape(rect(52, 60, 6, 12, 3), C.leaf, { sw: 2 }),
      shape(path(scallop(55, 56, 9, 6)), C.sage, { sw: 2 }),
      heart(66, 28, 1),
      heart(88, 18, 0.8),
      sparkle(150, 24, 0.7),
    ],
  },
  bag: {
    box: [160, 140],
    shapes: [
      shape(path('M46 66C40 42 52 14 62 12C72 12 72 32 68 66Z'), C.bread),
      line('M53 26L62 30M51 36L62 40M51 46L62 50', { sw: 2 }),
      leaf(100, 62, -55, 1.2),
      leaf(104, 60, -95, 1.15, C.leaf),
      leaf(110, 64, -35, 1.1),
      line('M58 62C58 34 102 34 102 62', { sw: 3.2 }),
      shape(path('M34 60L126 60L120 126C119 130 116 132 112 132L48 132C44 132 41 130 40 126Z'), C.cream),
      heart(80, 98, 2.4),
      sparkle(140, 30, 0.8),
      sprinkle([[22, 46], [140, 86, 1.5]]),
    ],
  },
  care: {
    box: [160, 140],
    shapes: [
      ground(130, 10, 150),
      line('M144 128C142 104 136 88 126 74', { stroke: C.leaf, sw: 2.4 }),
      leaf(138, 104, -130, 0.6),
      leaf(134, 92, -50, 0.6, C.leaf),
      leaf(128, 80, -140, 0.55),
      place(pumpBottle(), 38, 36),
      place(jar(), 86, 88),
      shape(circle(26, 48, 4.5), C.sky, { sw: 1.8 }),
      shape(circle(18, 62, 2.8), C.sky, { sw: 1.6 }),
      sparkle(112, 30, 0.7),
    ],
  },
  plane: {
    box: [190, 130],
    shapes: [
      shape(circle(156, 26, 13), C.butter),
      line('M8 88C22 82 28 78 40 73', { sw: 2, dash: '2 7' }),
      shape(path('M44 72L36 50L48 50L58 68Z'), C.rose),
      shape(path('M40 70C40 60 120 46 146 50C160 52 160 63 146 66C120 74 52 84 44 80C41 78 40 74 40 70Z'), C.white),
      shape(path('M86 66L72 94L88 94L110 62Z'), C.rose),
      dot(circle(96, 61, 3), C.sky), dot(circle(107, 59, 3), C.sky), dot(circle(118, 57, 3), C.sky),
      face(141, 57, 0.6),
      shape(path('M18 118C18 106 32 102 40 108C44 96 62 96 66 108C74 102 88 106 86 118Z'), C.white),
      shape(path('M112 122C112 112 124 108 130 114C134 104 150 104 152 114C160 110 170 114 168 122Z'), C.white),
      sparkle(22, 30, 0.7, C.pink),
    ],
  },
  popcorn: {
    box: [140, 140],
    shapes: [
      ...[[48, 52], [64, 44], [82, 46], [98, 54], [72, 32], [56, 34], [90, 36]].map(([x, y]) => shape(path(scallop(x, y, 11, 7)), C.cream, { sw: 2 })),
      shape(path('M34 60L106 60L96 128C95 131 92 133 89 133L51 133C48 133 45 131 44 128Z'), C.white),
      shape(path('M42 60H52L58 133H51Z'), C.rose, { sw: 0 }),
      shape(path('M64 60H76L74 133H66Z'), C.rose, { sw: 0 }),
      shape(path('M88 60H98L90 133H83Z'), C.rose, { sw: 0 }),
      line('M34 60L106 60L96 128C95 131 92 133 89 133L51 133C48 133 45 131 44 128Z'),
      shape(rect(50, 84, 40, 28, 10), C.white, { sw: 2 }),
      face(70, 95, 0.75),
      sparkle(118, 30, 0.75),
      sprinkle([[22, 50], [120, 80, 1.5]]),
    ],
  },
  notebook: {
    box: [160, 130],
    shapes: [
      shape(rect(30, 20, 88, 98, 7), C.white, { t: 'rotate(-6 74 69)' }),
      ...[0, 1, 2, 3, 4, 5].map((i) => shape(circle(34, 32 + i * 15, 3.4), C.cream, { t: 'rotate(-6 74 69)', sw: 1.8 })),
      ...[0, 1, 2].map((i) => shape(rect(46, 40 + i * 20, 9, 9, 2.5), i === 0 ? C.rose : C.white, { t: 'rotate(-6 74 69)', sw: 1.8 })),
      line('M48 44L51 47L56 40', { t: 'rotate(-6 74 69)', sw: 2 }),
      ...[0, 1, 2].map((i) => line(`M62 ${45 + i * 20}H${100 - i * 8}`, { t: 'rotate(-6 74 69)', op: 0.45, sw: 2 })),
      shape(path('M110 104L140 42L148 46L118 108Z'), C.butter),
      shape(path('M110 104L118 108L108 117Z'), C.bread, { sw: 2 }),
      shape(path('M140 42L148 46L151 39L143 35Z'), C.rose, { sw: 2 }),
      sparkle(132, 22, 0.8),
      heart(98, 108, 0.9),
    ],
  },
  coffee: {
    box: [120, 110],
    shapes: [
      shape(ellipse(58, 92, 34, 6), C.white),
      line('M82 50C97 48 99 66 80 68', { sw: 3 }),
      shape(path('M32 44L84 44C84 70 74 88 58 88C42 88 32 70 32 44Z'), C.white),
      shape(ellipse(58, 44, 26, 5.5), C.coffee),
      face(58, 62, 0.95),
      line('M50 34C44 28 56 24 50 16', { stroke: C.berry, sw: 2, op: 0.7 }),
      line('M66 32C60 26 72 22 66 14', { stroke: C.berry, sw: 2, op: 0.7 }),
      heart(88, 18, 0.9),
    ],
  },
  sprout: {
    box: [100, 130],
    shapes: [
      line('M50 92C50 70 48 52 44 36', { stroke: C.leaf, sw: 2.6 }),
      leaf(48, 74, -150, 0.85),
      leaf(50, 66, -30, 0.85, C.leaf),
      leaf(46, 50, -140, 0.75, C.leaf),
      leaf(46, 44, -45, 0.7),
      shape(path('M28 92H72L66 122C65 125 62 126 60 126H40C38 126 35 125 34 122Z'), C.rose),
      shape(rect(24, 86, 52, 10, 4), C.berry, { sw: 2 }),
      face(50, 106, 0.6),
      sparkle(82, 30, 0.6),
    ],
  },
}

// ---------- çizim ----------
const FILTER = (seed) =>
  `<filter id="w${seed}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>`

// Şekiller sırayla çizilir: öndeki nesnenin dolgusu arkadakinin çizgisini örter.
function render([w, h], shapes) {
  const g = (t, attrs, inner) => `<g${t ? ` transform="${t}"` : ''}${attrs}>${inner}</g>`
  const body = shapes
    .flat(Infinity)
    .map((s) => {
      let out = ''
      if (s.fill) out += `<g transform="translate(2.6 2.8)">${g(s.t, ` fill="${s.fill}" filter="url(#w8)"`, s.el)}</g>`
      if (s.outline && s.sw !== 0) {
        const attrs = [
          ` fill="none" stroke="${s.stroke ?? INK}" stroke-width="${s.sw ?? 2.4}"`,
          s.op ? ` opacity="${s.op}"` : '',
          s.dash ? ` stroke-dasharray="${s.dash}"` : '',
          ' filter="url(#w3)"',
        ].join('')
        out += g(s.t, attrs, s.el)
      }
      if (s.solid) out += g(s.t, ` fill="${s.solid}"${s.op ? ` opacity="${s.op}"` : ''} filter="url(#w3)"`, s.el)
      return out
    })
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>${FILTER(3)}${FILTER(8)}</defs>
<g stroke-linecap="round" stroke-linejoin="round">
${body}
</g>
</svg>
`
}

for (const [name, { box, shapes }] of Object.entries(ART)) {
  await writeFile(`public/art/${name}.svg`, render(box, shapes))
  console.log('çizildi:', name)
}
