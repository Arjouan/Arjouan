// Static profile highlights rendered as the Flight Log card.
// Edit STATS and run `node scripts/generate-flight-log.mjs` to regenerate flight-log.svg.
const STATS = [
  { label: "INTERNSHIPS", sub: "REACTIS · BARJANE · CPAM", value: "3" },
  { label: "COUNTRIES", sub: "lived in", value: "5" },
  { label: "LANGUAGES", sub: "EN · FR · ES · ZH", value: "4" },
];

function renderSvg(stats) {
  const cardWidth = 200;
  const cells = stats
    .map((s, i) => {
      const x = i * cardWidth;
      return `
    <g transform="translate(${x},0)">
      <line x1="0" y1="14" x2="0" y2="106" stroke="#30363d" stroke-width="${i === 0 ? 0 : 1.5}" stroke-dasharray="4 4"/>
      <text x="${cardWidth / 2}" y="50" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffb000">${s.value}</text>
      <text x="${cardWidth / 2}" y="74" text-anchor="middle" font-family="Courier New, monospace" font-size="11" letter-spacing="2" fill="#00f5a0">${s.label}</text>
      <text x="${cardWidth / 2}" y="92" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="#8b98a5">${s.sub}</text>
    </g>`;
    })
    .join("");

  const width = cardWidth * stats.length;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 120" width="100%" role="img" aria-label="Flight log: ${stats.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}">
  <defs>
    <linearGradient id="flg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="${width - 4}" height="116" rx="14" fill="#0d1117" stroke="url(#flg)" stroke-width="2"/>
  ${cells}
</svg>
`;
}

// Phones: one stat per row so the numbers and labels stay legible.
function renderMobileSvg(stats) {
  const rowH = 64;
  const height = rowH * stats.length + 8;
  const rows = stats
    .map((s, i) => {
      const y = 4 + i * rowH;
      return `
    <g transform="translate(0,${y})">
      <line x1="16" y1="0" x2="324" y2="0" stroke="#30363d" stroke-width="${i === 0 ? 0 : 1.2}" stroke-dasharray="4 4"/>
      <text x="62" y="44" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#ffb000">${s.value}</text>
      <text x="110" y="28" font-family="Courier New, monospace" font-size="15" font-weight="700" letter-spacing="2" fill="#00f5a0">${s.label}</text>
      <text x="110" y="48" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#8b98a5">${s.sub}</text>
    </g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 ${height}" width="100%" role="img" aria-label="Flight log: ${stats.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}">
  <defs>
    <linearGradient id="flgm" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="336" height="${height - 4}" rx="14" fill="#0d1117" stroke="url(#flgm)" stroke-width="2"/>
  ${rows}
</svg>
`;
}

const fs = await import("node:fs/promises");
await fs.writeFile(new URL("../flight-log.svg", import.meta.url), renderSvg(STATS));
await fs.writeFile(new URL("../flight-log.mobile.svg", import.meta.url), renderMobileSvg(STATS));
console.log("flight-log.svg updated");
