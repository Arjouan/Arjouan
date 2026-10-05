// 1280×640 social preview images (GitHub repo "Social preview") in the boarding-pass style.
// Run `node scripts/generate-social-previews.mjs`: writes assets/social/<repo>.svg and, if Google Chrome
// is installed, renders each to <repo>.png. Upload the PNG in each repo: Settings → General → Social preview.
import { writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PROJECTS } from "./data/projects.mjs";

const STATUS = { boarding: { label: "BOARDING", color: "#ffb000" }, landed: { label: "LANDED", color: "#00f5a0" } };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const PLANE = "M858 20.5 L872 20.5 L880 13 L883 13 L879 20.5 L886 20.5 L889 17 L891 17 L889.5 22 L891 27 L889 27 L886 23.5 L879 23.5 L883 31 L880 31 L872 23.5 L858 23.5 Z";

function previewSvg(p) {
  const status = STATUS[p.status];
  const chipW = status.label.length * 19 + 40;
  const descLines = [""];
  for (const w of p.desc.en.split(" ")) {
    const cur = descLines[descLines.length - 1];
    if (cur && (cur + " " + w).length > 46) descLines.push(w);
    else descLines[descLines.length - 1] = cur ? cur + " " + w : w;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" width="1280" height="640">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="640" fill="#010409"/>
  <rect x="40" y="40" width="1200" height="560" rx="36" fill="#0d1117" stroke="url(#g)" stroke-width="4"/>
  <line x1="930" y1="70" x2="930" y2="570" stroke="#30363d" stroke-width="3" stroke-dasharray="12 12"/>

  <text x="100" y="128" font-family="Courier New, monospace" font-size="26" letter-spacing="6" fill="#8b98a5">FLIGHT ${p.flight} · GATE ${esc(p.gate.en)}</text>
  <text x="100" y="270" font-family="Segoe UI, Arial, sans-serif" font-size="${p.title.length > 7 ? 104 : 124}" font-weight="700" fill="#f0f6fc">${esc(p.title)}</text>
  ${descLines.map((l, i) => `<text x="100" y="${330 + i * 38}" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#8b98a5">${esc(l)}</text>`).join("\n  ")}
  <line x1="100" y1="420" x2="870" y2="420" stroke="#30363d" stroke-width="2" stroke-dasharray="6 10"/>
  <text x="100" y="485" font-family="Courier New, monospace" font-size="34" font-weight="700" letter-spacing="3" fill="#00c6ff">${esc(p.stack)}</text>
  <text x="100" y="540" font-family="Courier New, monospace" font-size="22" letter-spacing="3" fill="#8b98a5">GITHUB.COM/ARJOUAN/${esc(p.repo.toUpperCase())}</text>

  <text x="970" y="128" font-family="Courier New, monospace" font-size="22" letter-spacing="4" fill="#8b98a5">STATUS</text>
  <rect x="970" y="152" width="${chipW}" height="56" rx="8" fill="none" stroke="${status.color}" stroke-width="3"/>
  <text x="${970 + chipW / 2}" y="190" text-anchor="middle" font-family="Courier New, monospace" font-size="30" font-weight="700" fill="${status.color}">${status.label}</text>
  <text x="970" y="280" font-family="Courier New, monospace" font-size="22" letter-spacing="4" fill="#8b98a5">PASSENGER</text>
  <text x="970" y="320" font-family="Segoe UI, Arial, sans-serif" font-size="27" font-weight="700" fill="#f0f6fc">ARNAUD JOUAN</text>
  <text x="970" y="390" font-family="Courier New, monospace" font-size="22" letter-spacing="4" fill="#8b98a5">SEAT</text>
  <text x="970" y="430" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="700" fill="#f0f6fc">4A</text>
  <g transform="translate(1135,520) scale(2.6) translate(-874.5,-22)"><path d="${PLANE}" fill="url(#g)" transform="matrix(-1 0 0 1 1749 0)"/></g>
</svg>
`;
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (const p of PROJECTS) {
  const svgUrl = new URL(`../assets/social/${p.repo}.svg`, import.meta.url);
  await writeFile(svgUrl, previewSvg(p));
  if (existsSync(CHROME)) {
    const png = fileURLToPath(new URL(`../assets/social/${p.repo}.png`, import.meta.url));
    execFileSync(CHROME, ["--headless", "--hide-scrollbars", "--window-size=1280,640", `--screenshot=${png}`, svgUrl.href], { stdio: "ignore" });
  }
}
console.log(`social previews updated (${PROJECTS.length})${existsSync(CHROME) ? " + PNG" : ""}`);
