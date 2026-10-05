// Tech stack drawn as luggage tags hanging from a baggage rail.
// Edit GROUPS and run `node scripts/generate-luggage-tags.mjs` to regenerate assets/luggage-tags*.svg (desktop + .mobile variants).
// Icons live in scripts/data/tech-icons.json (keys must match the names below).
import { readFile, writeFile } from "node:fs/promises";

const ICONS = JSON.parse(await readFile(new URL("./data/tech-icons.json", import.meta.url), "utf8"));

const GROUPS = [
  { key: "main", en: "MAIN BAGGAGE", fr: "BAGAGE PRINCIPAL", row: 0, items: ["C", "C++", "JAVA", "PYTHON"] },
  {
    key: "checking", en: "CHECKING IN · LEARNING", fr: "ENREGISTREMENT · EN COURS", row: 0, accent: true,
    items: ["NESTJS", "NEXT.JS", "PRISMA", "POSTGRESQL", "NEO4J"],
  },
  {
    key: "carry", en: "CARRY-ON", fr: "BAGAGE CABINE", row: 1,
    items: ["HTML5", "CSS3", "NODE.JS", "MYSQL", "LINUX", "VS CODE", "POWERSHELL", "WORDPRESS"],
  },
];

const W = 900;
const TAG_W = 80;
const TAG_H = 104;
const STEP = 92;
const GROUP_GAP = 44;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function barcode(name, x, y) {
  let seed = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const bars = [];
  for (let bx = 0; bx < 52; ) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const w = 1 + (seed >> 16) % 3;
    bars.push(`<rect x="${x + bx}" y="${y}" width="${w}" height="8"/>`);
    bx += w + 1 + ((seed >> 8) % 2);
  }
  return `<g fill="#30363d">${bars.join("")}</g>`;
}

function tag(name, x, y, sway) {
  const icon = ICONS[name];
  if (!icon) throw new Error(`No icon for ${name}`);
  const c = icon.color;
  const paths = icon.paths.map((d) => `<path d="${d}"/>`).join("");
  const fontSize = name.length > 8 ? 8.5 : 10;
  return `
  <g transform="translate(${x},${y}) rotate(${sway} ${TAG_W / 2} -18)">
    <path d="M${TAG_W / 2} -18 Q${TAG_W / 2 + sway * 2} -4 ${TAG_W / 2} 8" fill="none" stroke="#8b98a5" stroke-width="1.2"/>
    <path d="M10 0 H${TAG_W - 10} L${TAG_W} 14 V${TAG_H - 8} Q${TAG_W} ${TAG_H} ${TAG_W - 8} ${TAG_H} H8 Q0 ${TAG_H} 0 ${TAG_H - 8} V14 Z" fill="#0d1117" stroke="${c}" stroke-width="1.6"/>
    <circle cx="${TAG_W / 2}" cy="11" r="4" fill="#161b22" stroke="#30363d" stroke-width="1.2"/>
    <rect x="0.8" y="21" width="${TAG_W - 1.6}" height="4" fill="${c}"/>
    <g transform="translate(${TAG_W / 2 - 15},33) scale(1.25)" fill="${c}">${paths}</g>
    <text x="${TAG_W / 2}" y="80" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="0.4" fill="${c}">${esc(name)}</text>
    ${barcode(name, TAG_W / 2 - 26, 88)}
  </g>`;
}

// Each row is a list of { group, items, label } segments laid out side by side.
function desktopRows() {
  return [0, 1].map((r) =>
    GROUPS.filter((g) => g.row === r).map((g) => ({ group: g, items: g.items, label: true })),
  );
}

// Phones: one group per row, at most 4 tags per row, so the canvas is narrow and tags render larger.
function mobileRows() {
  const rows = [];
  for (const g of GROUPS) {
    const per = Math.ceil(g.items.length / Math.ceil(g.items.length / 4));
    for (let i = 0; i < g.items.length; i += per) {
      rows.push([{ group: g, items: g.items.slice(i, i + per), label: i === 0 }]);
    }
  }
  return rows;
}

function render(lang, rows, W) {
  let out = "";
  let top = 10;
  rows.forEach((segments, r) => {
    const labelled = segments.some((seg) => seg.label);
    const total = segments.reduce((a, seg) => a + seg.items.length * STEP, 0) - (STEP - TAG_W) + GROUP_GAP * (segments.length - 1);
    let x = (W - total) / 2;
    const railY = top + (labelled ? 26 : 8);
    segments.forEach((seg, gi) => {
      const width = seg.items.length * STEP - (STEP - TAG_W);
      const color = seg.group.accent ? "#ffb000" : "#00f5a0";
      if (seg.label) out += `
  <text x="${x}" y="${top + 12}" font-family="Courier New, monospace" font-size="11" font-weight="700" letter-spacing="2" fill="${color}">${seg.group[lang]}</text>`;
      out += `
  <line x1="${x - 6}" y1="${railY}" x2="${x + width + 6}" y2="${railY}" stroke="#30363d" stroke-width="3" stroke-linecap="round"/>`;
      seg.items.forEach((name, i) => {
        const sway = [-2, 1.5, -1, 2, -1.5, 1][(i + gi + r) % 6];
        out += tag(name, x + i * STEP, railY + 18, sway);
      });
      x += width + GROUP_GAP;
    });
    top = railY + 18 + TAG_H + 22;
  });
  const all = GROUPS.map((g) => `${g[lang]}: ${g.items.join(", ")}`).join("; ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${top - 12}" width="100%" role="img" aria-label="${esc(all)}">${out}
</svg>
`;
}

for (const lang of ["en", "fr"]) {
  const base = `../assets/luggage-tags${lang === "fr" ? ".fr" : ""}`;
  await writeFile(new URL(`${base}.svg`, import.meta.url), render(lang, desktopRows(), 900));
  await writeFile(new URL(`${base}.mobile.svg`, import.meta.url), render(lang, mobileRows(), 380));
}
console.log("luggage tags updated");
