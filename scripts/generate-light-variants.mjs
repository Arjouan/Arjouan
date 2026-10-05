// Light-mode ("day flight") variants of every themed SVG, by remapping the dark palette.
// x.svg → x.light.svg and x.mobile.svg → x.mobile.light.svg; the README picks them with prefers-color-scheme.
// Run after any generator (the flight-log workflow runs it daily). Brand/logo colours are left untouched.
import { readdir, readFile, writeFile } from "node:fs/promises";

const PALETTE = {
  "#0d1117": "#ffffff", // card background
  "#161b22": "#f6f8fa",
  "#1c2530": "#d8dee4", // board guides, radar rings
  "#30363d": "#d0d7de", // dashed lines, rails
  "#26506b": "#a5bccb", // map / radar dots
  "#8b98a5": "#59636e", // muted text
  "#f0f6fc": "#1f2328", // primary text
  "#00f5a0": "#00995f", // green accent
  "#00c6ff": "#0080c0", // cyan accent
  "#0072ff": "#0059d6",
  "#ffb000": "#a86400", // amber accent
  "#4aa8ff": "#0969da",
  "#fcc624": "#a68000", // Linux yellow, unreadable on white
  "#000000": "#afb8c1", // split-flap divider
};
const SKIP = /^(language-stamps|preview)|\.light\.svg$/;
const pattern = new RegExp(Object.keys(PALETTE).join("|"), "gi");

function toLight(svg, name) {
  // Keep the footer QR code dark-on-white so it stays scannable.
  const qr = [];
  if (name.startsWith("boarding-pass-footer")) {
    svg = svg.replace(/<rect x="798" y="14" width="74" height="74" rx="4" fill="#f0f6fc"\/>\s*<g fill="#0d1117">[\s\S]*?<\/g>/, (m) => {
      qr.push(m.replace('fill="#f0f6fc"', 'fill="#ffffff" stroke="#d0d7de"'));
      return "%%QR%%";
    });
  }
  svg = svg.replace(pattern, (hex) => PALETTE[hex.toLowerCase()]);
  return svg.replace("%%QR%%", () => qr[0]);
}

let count = 0;
for (const dir of ["", "assets/"]) {
  for (const name of await readdir(new URL(`../${dir}`, import.meta.url))) {
    if (!name.endsWith(".svg") || SKIP.test(name) || name === "blank.svg") continue;
    const src = new URL(`../${dir}${name}`, import.meta.url);
    const svg = await readFile(src, "utf8");
    await writeFile(new URL(`../${dir}${name.replace(/\.svg$/, ".light.svg")}`, import.meta.url), toLight(svg, name));
    count++;
  }
}
console.log(`light variants updated (${count})`);
