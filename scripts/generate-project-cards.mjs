// Boarding-pass style project cards for the Flight Manifest section.
// Edit PROJECTS and run `node scripts/generate-project-cards.mjs` to regenerate assets/project-*.svg.
const PROJECTS = [
  {
    slug: "meridian", title: "MERIDIAN", flight: "AJ-01", status: "boarding",
    gate: { en: "PERSONAL", fr: "PERSO" },
    desc: {
      en: "Vessel Management System for maritime logistics, built end to end",
      fr: "Gestion de flotte pour la logistique maritime, développée de A à Z",
    },
    stack: "NESTJS · PRISMA · POSTGIS · NEXT.JS",
  },
  {
    slug: "rtype", title: "R-TYPE", flight: "AJ-02", status: "landed",
    gate: { en: "EPITECH Y3", fr: "EPITECH A3" },
    desc: {
      en: "Authoritative multiplayer remake with a custom ECS and UDP protocol",
      fr: "Remake multijoueur autoritaire, ECS maison et protocole binaire UDP",
    },
    stack: "C++20 · SFML",
  },
  {
    slug: "area", title: "AREA", flight: "AJ-03", status: "landed",
    gate: { en: "EPITECH Y3", fr: "EPITECH A3" },
    desc: {
      en: "IFTTT-style automation platform with OAuth integrations and hooks",
      fr: "Plateforme d'automatisation façon IFTTT, intégrations OAuth et hooks",
    },
    stack: "FASTAPI · VUE · ANDROID",
  },
  {
    slug: "zappy", title: "ZAPPY", flight: "AJ-04", status: "landed",
    gate: { en: "EPITECH Y2", fr: "EPITECH A2" },
    desc: {
      en: "Multiplayer network game: server, AI client and 2D GUI",
      fr: "Jeu en réseau multijoueur : serveur, IA client et interface 2D",
    },
    stack: "C · C++",
  },
];

const STATUS = {
  boarding: { en: "BOARDING", fr: "EMBARQUEMENT", color: "#ffb000" },
  landed: { en: "LANDED", fr: "ATTERRI", color: "#00f5a0" },
};
const COPY = { en: { flight: "FLIGHT", gate: "GATE" }, fr: { flight: "VOL", gate: "PORTE" } };

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function cardSvg(p, lang) {
  const status = STATUS[p.status];
  const id = `pc-${p.slug}-${lang}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 150" width="420" role="img" aria-label="${esc(p.title)}: ${esc(status[lang])} - ${esc(p.desc[lang])} (${esc(p.stack)})">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="416" height="146" rx="14" fill="#0d1117" stroke="url(#${id})" stroke-width="2"/>
  <text x="24" y="28" font-family="Courier New, monospace" font-size="10" letter-spacing="2" fill="#8b98a5">${COPY[lang].flight} ${p.flight} · ${COPY[lang].gate} ${esc(p.gate[lang])}</text>
  <rect x="${396 - status[lang].length * 7.4 - 14}" y="14" width="${status[lang].length * 7.4 + 14}" height="20" rx="4" fill="none" stroke="${status.color}" stroke-width="1.2"/>
  <text x="${396 - (status[lang].length * 7.4 + 14) / 2}" y="28" text-anchor="middle" font-family="Courier New, monospace" font-size="11" font-weight="700" letter-spacing="1" fill="${status.color}">${status[lang]}</text>
  <text x="24" y="66" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#f0f6fc">${esc(p.title)}</text>
  <text x="24" y="92" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#8b98a5">${esc(p.desc[lang])}</text>
  <line x1="24" y1="110" x2="396" y2="110" stroke="#30363d" stroke-width="1" stroke-dasharray="3 5"/>
  <text x="24" y="131" font-family="Courier New, monospace" font-size="11" font-weight="700" letter-spacing="1.5" fill="#00c6ff">${esc(p.stack)}</text>
  <path d="M388 126 L398 126 L404 121 L406 121 L403 126 L408 126 L410 124 L411 124 L410 127.5 L411 131 L410 131 L408 129 L403 129 L406 134 L404 134 L398 129 L388 129 Z" fill="url(#${id})" transform="matrix(-1 0 0 1 799 0)"/>
</svg>
`;
}

// Compact card for phones: at half the screen width the desktop card's text is unreadable,
// so this drops the description and wraps the stack onto short lines.
function mobileCardSvg(p, lang) {
  const status = STATUS[p.status];
  const id = `pcm-${p.slug}-${lang}`;
  const parts = p.stack.split(" · ");
  const lines = [];
  for (const part of parts) {
    const last = lines[lines.length - 1];
    if (last && (last + " · " + part).length <= 20) lines[lines.length - 1] = last + " · " + part;
    else lines.push(part);
  }
  const chipW = status[lang].length * 8.2 + 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" width="200" role="img" aria-label="${esc(p.title)}: ${esc(status[lang])} (${esc(p.stack)})">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="196" height="146" rx="14" fill="#0d1117" stroke="url(#${id})" stroke-width="2"/>
  <rect x="14" y="14" width="${chipW}" height="22" rx="4" fill="none" stroke="${status.color}" stroke-width="1.4"/>
  <text x="${14 + chipW / 2}" y="29.5" text-anchor="middle" font-family="Courier New, monospace" font-size="12" font-weight="700" fill="${status.color}">${status[lang]}</text>
  <text x="14" y="70" font-family="Segoe UI, Arial, sans-serif" font-size="${p.title.length > 8 ? 20 : 24}" font-weight="700" fill="#f0f6fc">${esc(p.title)}</text>
  <line x1="14" y1="86" x2="186" y2="86" stroke="#30363d" stroke-width="1" stroke-dasharray="3 5"/>
  ${lines.map((l, i) => `<text x="14" y="${108 + i * 20}" font-family="Courier New, monospace" font-size="13" font-weight="700" fill="#00c6ff">${esc(l)}</text>`).join("\n  ")}
</svg>
`;
}

const fs = await import("node:fs/promises");
for (const p of PROJECTS) {
  for (const lang of ["en", "fr"]) {
    const base = `../assets/project-${p.slug}${lang === "fr" ? ".fr" : ""}`;
    await fs.writeFile(new URL(`${base}.svg`, import.meta.url), cardSvg(p, lang));
    await fs.writeFile(new URL(`${base}.mobile.svg`, import.meta.url), mobileCardSvg(p, lang));
  }
}
console.log(`project cards updated (${PROJECTS.length} × 2)`);
