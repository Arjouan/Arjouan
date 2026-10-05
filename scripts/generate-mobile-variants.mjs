// Phone-sized variants of the hand-made SVGs (boarding pass, departure board, footer, internship stamps).
// The README serves them through <picture media="(max-width: 600px)">, so desktop files stay untouched.
// Run `node scripts/generate-mobile-variants.mjs` after editing any of the texts below.
import { readFile, writeFile } from "node:fs/promises";

const out = (name, svg) => writeFile(new URL(`../${name}`, import.meta.url), svg);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const GRADIENT = (id, diagonal = false) => `
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="${diagonal ? 1 : 0}">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>`;
const REDUCED_MOTION = `
  <style>
    .still { display: none; }
    @media (prefers-reduced-motion: reduce) { .motion { display: none; } .still { display: inline; } }
  </style>`;

const COPY = {
  en: {
    pass: "BOARDING PASS", role: "SOFTWARE ENGINEER · 4TH YEAR AT EPITECH",
    from: ["EPITECH", "MARSEILLE, FRANCE"], to: ["MCGILL", "MONTREAL, CANADA"],
    seat: "SEAT", klass: "CLASS", klassValue: "MANAGEMENT EXCHANGE", status: "STATUS", statusValue: "OPEN TO INTERNSHIPS",
    passLabel: "Boarding pass for Arnaud Jouan, EPITECH to McGill University",
    board: ["4TH YEAR CS ENGINEER — EPITECH", "ON EXCHANGE — MCGILL — MANAGEMENT", "ALWAYS LEARNING, ALWAYS SHIPPING"],
    boardLabel: "Departure board",
    thanks: ["Thanks for stopping by", "my layover"], next: ["NEXT DESTINATION: YOUR INBOX", "LET'S TALK"],
    footerLabel: "Footer: thanks for stopping by my layover",
  },
  fr: {
    pass: "CARTE D'EMBARQUEMENT", role: "INGÉNIEUR LOGICIEL · 4E ANNÉE À EPITECH",
    from: ["EPITECH", "MARSEILLE, FRANCE"], to: ["MCGILL", "MONTRÉAL, CANADA"],
    seat: "SIÈGE", klass: "CLASSE", klassValue: "ÉCHANGE MANAGEMENT", status: "STATUT", statusValue: "OUVERT AUX STAGES",
    passLabel: "Carte d'embarquement d'Arnaud Jouan, d'EPITECH vers McGill University",
    board: ["ÉTUDIANT INGÉNIEUR 4E ANNÉE — EPITECH", "ÉCHANGE À MCGILL — MANAGEMENT", "TOUJOURS APPRENDRE, TOUJOURS LIVRER"],
    boardLabel: "Tableau des départs",
    thanks: ["Merci de votre escale"], next: ["PROCHAINE DESTINATION :", "VOTRE BOÎTE MAIL"],
    footerLabel: "Pied de page : merci de votre escale",
  },
};

const PLANE = "M-9 -5 L9 0 L-9 5 L-3 0 Z";

// One light sweep across the card when the page loads (hidden with reduced motion).
const SHIMMER = (w, h) => `
  <style>
    .shimmer { animation: sweep 1.8s ease-in-out 0.5s both; }
    @keyframes sweep { from { transform: translateX(0) skewX(-20deg); } to { transform: translateX(${w + 300}px) skewX(-20deg); } }
    @media (prefers-reduced-motion: reduce) { .shimmer { display: none; } }
  </style>
  <defs>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="card"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18"/></clipPath>
  </defs>`;

function boardingPass(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 300" width="100%" role="img" aria-label="${esc(c.passLabel)}">
  <defs>${GRADIENT("bpm", true)}
  </defs>${REDUCED_MOTION}${SHIMMER(380, 300)}
  <rect x="2" y="2" width="376" height="296" rx="18" fill="#0d1117" stroke="url(#bpm)" stroke-width="2"/>
  <text x="22" y="36" font-family="Courier New, monospace" font-size="13" letter-spacing="3" fill="#00f5a0">${esc(c.pass)}</text>
  <text x="22" y="74" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#f0f6fc">ARNAUD JOUAN</text>
  <text x="22" y="96" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#8b98a5">${esc(c.role)}</text>

  <text x="22" y="142" font-family="Courier New, monospace" font-size="22" font-weight="700" fill="#00c6ff">${c.from[0]}</text>
  <text x="22" y="160" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#8b98a5">${esc(c.from[1])}</text>
  <text x="358" y="142" text-anchor="end" font-family="Courier New, monospace" font-size="22" font-weight="700" fill="#00f5a0">${c.to[0]}</text>
  <text x="358" y="160" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#8b98a5">${esc(c.to[1])}</text>
  <line x1="132" y1="135" x2="262" y2="135" stroke="#30363d" stroke-width="1.5" stroke-dasharray="2 6"/>
  <path class="motion" d="${PLANE}" fill="url(#bpm)">
    <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto" path="M132 135 L262 135"/>
  </path>
  <path class="still" d="${PLANE}" fill="url(#bpm)" transform="translate(197,135)"/>

  <line x1="14" y1="182" x2="366" y2="182" stroke="#30363d" stroke-width="2" stroke-dasharray="7 7"/>
  <text x="22" y="210" font-family="Courier New, monospace" font-size="11" letter-spacing="2" fill="#8b98a5">${esc(c.seat)}</text>
  <text x="22" y="232" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" fill="#f0f6fc">4A</text>
  <text x="100" y="210" font-family="Courier New, monospace" font-size="11" letter-spacing="2" fill="#8b98a5">${esc(c.klass)}</text>
  <text x="100" y="232" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" fill="#f0f6fc">${esc(c.klassValue)}</text>
  <text x="22" y="262" font-family="Courier New, monospace" font-size="11" letter-spacing="2" fill="#8b98a5">${esc(c.status)}</text>
  <text x="22" y="284" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" fill="#ffb000">${esc(c.statusValue)}</text>
  <g clip-path="url(#card)"><rect class="shimmer" x="-200" y="-60" width="120" height="420" fill="url(#shine)"/></g>
</svg>
`;
}

// Split-flap board: each message wrapped onto two rows of COLS cells, flipping every 4s like the desktop board.
const COLS = 19;
const FLIPS = [
  { values: "1 1;1 1;1 0;1 0;1 1", keyTimes: "0;0.3;0.3333;0.9667;1" },
  { values: "1 0;1 0;1 1;1 1;1 0;1 0", keyTimes: "0;0.3;0.3333;0.6333;0.6667;1" },
  { values: "1 0;1 0;1 1;1 1;1 0", keyTimes: "0;0.6333;0.6667;0.9667;1" },
];

function wrap(message) {
  const lines = [""];
  for (const word of message.split(" ")) {
    const cur = lines[lines.length - 1];
    if (!cur) lines[lines.length - 1] = word;
    else if ((cur + " " + word).length <= COLS) lines[lines.length - 1] = cur + " " + word;
    else lines.push(word);
  }
  if (lines.length > 2 || lines.some((l) => l.length > COLS)) throw new Error(`"${message}" does not fit on 2×${COLS}`);
  while (lines.length < 2) lines.push("");
  return lines.map((l) => {
    const pad = Math.floor((COLS - [...l].length) / 2);
    return [...(" ".repeat(pad) + l).padEnd(COLS, " ")];
  });
}

function departureBoard(c) {
  const PITCH = 19.5, X0 = 12, ROW_H = 36, TOP = 8;
  const W = X0 * 2 + PITCH * COLS;
  const H = TOP * 2 + ROW_H * 2;
  const grids = c.board.map(wrap);
  let cells = "", still = "", guides = "", n = 0;
  for (let i = 1; i < COLS; i++) guides += `<line x1="${(X0 + i * PITCH).toFixed(1)}" y1="2" x2="${(X0 + i * PITCH).toFixed(1)}" y2="${H - 2}"/>`;
  for (let r = 0; r < 2; r++) {
    const cy = TOP + ROW_H * r + ROW_H / 2;
    for (let i = 0; i < COLS; i++) {
      const x = (X0 + i * PITCH + PITCH / 2).toFixed(1);
      const letters = grids
        .map((g, m) => (g[r][i] === " " ? "" : `<g><animateTransform attributeName="transform" type="scale" values="${FLIPS[m].values}" keyTimes="${FLIPS[m].keyTimes}" dur="12s" repeatCount="indefinite"/><text x="0" y="6" text-anchor="middle">${esc(g[r][i])}</text></g>`))
        .join("");
      // Cells light up left to right once on load (opacity only, so it never fights the flip animation)
      if (letters) cells += `\n    <g class="cell" style="animation-delay:${(0.2 + n++ * 0.035).toFixed(3)}s" transform="translate(${x},${cy})">${letters}</g>`;
      if (grids[0][r][i] !== " ") still += `\n    <text transform="translate(${x},${cy})" x="0" y="6" text-anchor="middle">${esc(grids[0][r][i])}</text>`;
    }
  }
  const font = `font-family="Courier New, monospace" font-size="17" font-weight="700" fill="url(#dbm)"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(c.boardLabel)}: ${esc(c.board.join(", "))}">
  <defs>${GRADIENT("dbm")}
  </defs>${REDUCED_MOTION}
  <style>
    .cell { animation: power-on 0.3s ease-out both; }
    @keyframes power-on { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .cell { animation: none; } }
  </style>
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="#0d1117" stroke="url(#dbm)" stroke-width="2"/>
  <g stroke="#1c2530" stroke-width="1">${guides}</g>
  <line x1="2" y1="${TOP + ROW_H / 2}" x2="${W - 2}" y2="${TOP + ROW_H / 2}" stroke="#000" stroke-opacity="0.55" stroke-width="1.2"/>
  <line x1="2" y1="${TOP + ROW_H * 1.5}" x2="${W - 2}" y2="${TOP + ROW_H * 1.5}" stroke="#000" stroke-opacity="0.55" stroke-width="1.2"/>
  <g class="motion" ${font}>${cells}
  </g>
  <g class="still" ${font}>${still}
  </g>
</svg>
`;
}

function footer(c) {
  const H = 200;
  const titleY = c.thanks.length > 1 ? [62, 90] : [76];
  const nextY = [126, 144];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 ${H}" width="100%" role="img" aria-label="${esc(c.footerLabel)}">
  <defs>${GRADIENT("bpfm")}
  </defs>${REDUCED_MOTION}
  <rect x="2" y="2" width="376" height="${H - 4}" rx="18" fill="#0d1117" stroke="url(#bpfm)" stroke-width="2"/>
  <line x1="20" y1="172" x2="360" y2="172" stroke="#30363d" stroke-width="1.5" stroke-dasharray="10 6"/>
  <path class="motion" d="M-10 -6 L12 0 L-10 6 L-3 0 Z" fill="url(#bpfm)">
    <animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path="M24 26 C110 26, 140 172, 200 172 L350 172"/>
  </path>
  <path class="still" d="M-10 -6 L12 0 L-10 6 L-3 0 Z" fill="url(#bpfm)" transform="translate(340,172)"/>
  ${c.thanks.map((t, i) => `<text x="190" y="${titleY[i]}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#f0f6fc">${esc(t)}</text>`).join("\n  ")}
  ${c.next.map((t, i) => `<text x="190" y="${nextY[i]}" text-anchor="middle" font-family="Courier New, monospace" font-size="12" letter-spacing="2" fill="#8b98a5">${esc(t)}</text>`).join("\n  ")}
</svg>
`;
}

// Internship stamps: same stamps, packed closer on a narrower canvas.
async function stamps() {
  let s = await readFile(new URL("../passport-stamps.svg", import.meta.url), "utf8");
  s = s.replace('viewBox="0 0 720 165" width="720"', 'viewBox="0 0 400 165" width="400"');
  for (const [from, to] of [["130", "68"], ["360", "200"], ["590", "332"]]) {
    s = s.replace(`<g transform="translate(${from},82)`, `<g transform="translate(${to},82)`);
  }
  return s;
}

for (const lang of ["en", "fr"]) {
  const sfx = lang === "fr" ? ".fr" : "";
  await out(`boarding-pass-header${sfx}.mobile.svg`, boardingPass(COPY[lang]));
  await out(`departure-board${sfx}.mobile.svg`, departureBoard(COPY[lang]));
  await out(`boarding-pass-footer${sfx}.mobile.svg`, footer(COPY[lang]));
}
await out("passport-stamps.mobile.svg", await stamps());
// Transparent 1px-tall placeholder: lets one <picture> show an image on desktop only (or phone only).
await out("assets/blank.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1" width="100%"/>\n`);
console.log("mobile variants updated");
