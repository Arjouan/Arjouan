// Dot-matrix world map with curved flight arcs between the countries I have lived in.
// Needs map data at build time only: `npm i --no-save d3-geo topojson-client world-atlas`,
// then run `node scripts/generate-journey.mjs` to regenerate journey.svg and journey.fr.svg.
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const world = JSON.parse(await readFile(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(world, world.objects.land);

const STOPS = [
  { en: "Singapore", fr: "Singapour", lon: 103.8, lat: 1.35, dx: -14, dy: 20, anchor: "end" },
  { en: "Vietnam", fr: "Vietnam", lon: 106.7, lat: 14.5, dx: -14, dy: -6, anchor: "end" },
  { en: "Australia", fr: "Australie", lon: 145, lat: -27, dx: 12, dy: 26, anchor: "end" },
  { en: "France", fr: "France", lon: 4, lat: 45.5, dx: 0, dy: -14, anchor: "middle" },
  { en: "Canada", fr: "Canada", lon: -73.6, lat: 45.5, dx: 0, dy: -14, anchor: "middle" },
];

const LON_MIN = -100, LON_MAX = 165, LAT_MAX = 68, LAT_MIN = -46;
const W = 900;
const K = W / (LON_MAX - LON_MIN);
const H = Math.round((LAT_MAX - LAT_MIN) * K);
const project = (lon, lat) => [(lon - LON_MIN) * K, (LAT_MAX - lat) * K];

// Land dots
const STEP = 7;
const dots = [];
for (let y = STEP / 2; y < H; y += STEP) {
  for (let x = STEP / 2; x < W; x += STEP) {
    const lon = LON_MIN + x / K;
    const lat = LAT_MAX - y / K;
    if (geoContains(land, [lon, lat])) dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5"/>`);
  }
}

// Flight arcs: quadratic curves bowed upward (perpendicular to each leg)
const pts = STOPS.map((s) => project(s.lon, s.lat));
const legs = [];
for (let i = 0; i < pts.length - 1; i++) {
  const [x1, y1] = pts[i];
  const [x2, y2] = pts[i + 1];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  let nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const bow = Math.min(90, len * 0.25);
  legs.push({ x1, y1, x2, y2, cx: mx + nx * bow, cy: my + ny * bow });
}
const quadLen = (l) => {
  let total = 0, px = l.x1, py = l.y1;
  for (let t = 0.02; t <= 1.0001; t += 0.02) {
    const x = (1 - t) ** 2 * l.x1 + 2 * (1 - t) * t * l.cx + t * t * l.x2;
    const y = (1 - t) ** 2 * l.y1 + 2 * (1 - t) * t * l.cy + t * t * l.y2;
    total += Math.hypot(x - px, y - py); px = x; py = y;
  }
  return total;
};
const lens = legs.map(quadLen);
const totalLen = lens.reduce((a, b) => a + b, 0);
const f = (n) => n.toFixed(1);
const routeD = `M${f(legs[0].x1)} ${f(legs[0].y1)} ` + legs.map((l) => `Q${f(l.cx)} ${f(l.cy)} ${f(l.x2)} ${f(l.y2)}`).join(" ");

// Plane pauses at each stop: keyPoints hold at cumulative distances
const cum = [0];
lens.forEach((l) => cum.push(cum[cum.length - 1] + l / totalLen));
const n = cum.length;
const pause = 0.04;
const keyPoints = [], keyTimes = [];
const move = (1 - pause * n) / (n - 1);
let t = 0;
cum.forEach((c, i) => {
  keyPoints.push(c.toFixed(4)); keyTimes.push(t.toFixed(4));
  t += pause;
  keyPoints.push(c.toFixed(4)); keyTimes.push(Math.min(1, t).toFixed(4));
  if (i < n - 1) t += move;
});

// `big` scales labels/markers up for the phone variant, where the 900-wide map renders at ~40%.
function render(lang, big = 1) {
  const label = lang === "fr" ? "Itinéraire à travers les pays où j'ai vécu" : "Flight route across the countries I have lived in";
  const names = STOPS.map((s) => s[lang]).join(" → ");
  const markers = pts.map(([x, y], i) => {
    const s = STOPS[i];
    const last = i === pts.length - 1;
    return `
    <circle cx="${f(x)}" cy="${f(y)}" r="${9 * big}" fill="none" stroke="${last ? "#ffb000" : "#00c6ff"}" stroke-width="${1.2 * big}" opacity="0.5"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${4.5 * big}" fill="${last ? "#ffb000" : "#00c6ff"}"/>
    <text x="${f(x + s.dx * big)}" y="${f(y + s.dy * big)}" text-anchor="${s.anchor}" font-family="Segoe UI, Arial, sans-serif" font-size="${14 * big}" font-weight="700" fill="${last ? "#ffb000" : "#f0f6fc"}">${s[lang]}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${label}: ${names}">
  <defs>
    <linearGradient id="jg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <style>
    .still { display: none; }
    @media (prefers-reduced-motion: reduce) { .motion { display: none; } .still { display: inline; } }
  </style>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  <g fill="#26506b">${dots.join("")}</g>
  <path d="${routeD}" fill="none" stroke="#00c6ff" stroke-width="${2.2 * big}" stroke-dasharray="${3 * big} ${7 * big}" stroke-linecap="round"/>
  <g>${markers}
  </g>
  <path class="motion" d="M-11 -6 L11 0 L-11 6 L-4 0 Z" fill="#ffb000" transform="scale(${big})">
    <animateMotion dur="12s" repeatCount="indefinite" rotate="auto" calcMode="linear" keyPoints="${keyPoints.join(";")}" keyTimes="${keyTimes.join(";")}" path="${routeD}"/>
  </path>
  <path class="still" d="M-11 -6 L11 0 L-11 6 L-4 0 Z" fill="#ffb000" transform="translate(${f(pts[pts.length - 1][0] + 24)},${f(pts[pts.length - 1][1] - 6)}) rotate(195) scale(${big})"/>
</svg>
`;
}

for (const lang of ["en", "fr"]) {
  const base = `../journey${lang === "fr" ? ".fr" : ""}`;
  await writeFile(new URL(`${base}.svg`, import.meta.url), render(lang));
  await writeFile(new URL(`${base}.mobile.svg`, import.meta.url), render(lang, 2.2));
}
console.log(`journey map updated (${dots.length} land dots, ${W}x${H})`);
