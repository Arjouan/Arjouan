// Slim "GATE" strips used in place of the plain ## section headings.
// Edit SECTIONS and run `node scripts/generate-section-headers.mjs` to regenerate assets/gate-*.svg (desktop + .mobile variants).
const SECTIONS = [
  { slug: "about", gate: "A1", en: "ABOUT ME", fr: "À PROPOS" },
  { slug: "journey", gate: "A2", en: "MY JOURNEY", fr: "MON PARCOURS" },
  { slug: "stack", gate: "A3", en: "TECH STACK", fr: "TECHNOLOGIES" },
  { slug: "internships", gate: "B1", en: "INTERNSHIPS", fr: "STAGES" },
  { slug: "manifest", gate: "B2", en: "FLIGHT MANIFEST", fr: "MANIFESTE DE VOL" },
  { slug: "connect", gate: "C1", en: "CONNECT WITH ME", fr: "ME CONTACTER" },
  { slug: "log", gate: "C2", en: "FLIGHT LOG", fr: "JOURNAL DE VOL" },
];
const GATE = { en: "GATE", fr: "PORTE" };

function stripSvg(s, lang, W = 900) {
  const id = `gh-${s.slug}-${lang}`;
  const label = `${GATE[lang]} ${s.gate}`;
  const labelWidth = label.length * 8.4 + 28;
  const titleEnd = labelWidth + 18 + s[lang].length * 12.6;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 44" width="100%" role="img" aria-label="${label} · ${s[lang]}">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="42" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  <rect x="1" y="1" width="${labelWidth}" height="42" rx="10" fill="#ffb000"/>
  <rect x="${labelWidth - 10}" y="1" width="10" height="42" fill="#ffb000"/>
  <text x="${labelWidth / 2 + 1}" y="27" text-anchor="middle" font-family="Courier New, monospace" font-size="14" font-weight="700" letter-spacing="1" fill="#0d1117">${label}</text>
  <text x="${labelWidth + 18}" y="28" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="2" fill="#f0f6fc">${s[lang]}</text>
  <line x1="${titleEnd + 16}" y1="22" x2="${W - 48}" y2="22" stroke="#30363d" stroke-width="1.5" stroke-dasharray="6 5"/>
  <g transform="translate(${W - 900},0)"><path d="M858 20.5 L872 20.5 L880 13 L883 13 L879 20.5 L886 20.5 L889 17 L891 17 L889.5 22 L891 27 L889 27 L886 23.5 L879 23.5 L883 31 L880 31 L872 23.5 L858 23.5 Z" fill="url(#${id})" transform="matrix(-1 0 0 1 1749 0)"/></g>
</svg>
`;
}

const fs = await import("node:fs/promises");
for (const s of SECTIONS) {
  for (const lang of ["en", "fr"]) {
    const base = `../assets/gate-${s.slug}${lang === "fr" ? ".fr" : ""}`;
    await fs.writeFile(new URL(`${base}.svg`, import.meta.url), stripSvg(s, lang));
    // Narrower canvas for phones so the text renders larger (served via <picture> in the README)
    await fs.writeFile(new URL(`${base}.mobile.svg`, import.meta.url), stripSvg(s, lang, 400));
  }
}
console.log(`section headers updated (${SECTIONS.length} × 2)`);
