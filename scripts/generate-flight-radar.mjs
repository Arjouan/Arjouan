// "Flight radar": the past year of contributions drawn as blips on a radar screen with a rotating sweep.
// Each day sits at an angle (oldest → newest, clockwise from the top) and a ring (its weekday);
// blip size follows that day's contribution count. Regenerated daily by the flight-log workflow.
// Needs GH_STATS_TOKEN or GITHUB_TOKEN (GraphQL). Writes flight-radar{.fr}{.mobile}.svg.
import { writeFile } from "node:fs/promises";

const USERNAME = "Arjouan";
const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;

const COPY = {
  en: {
    title: "FLIGHT RADAR", sub: "Contributions over the past 12 months",
    total: "CONTACTS", totalSub: "contributions this year",
    peak: "PEAK TRAFFIC", peakSub: (d) => `contributions on ${d}`,
    last: "LAST CONTACT", lastSub: "most recent activity",
    updated: "UPDATED", locale: "en-US", label: "Flight radar of contributions",
  },
  fr: {
    title: "RADAR DE VOL", sub: "Contributions sur les 12 derniers mois",
    total: "CONTACTS", totalSub: "contributions cette année",
    peak: "PIC DE TRAFIC", peakSub: (d) => `contributions le ${d}`,
    last: "DERNIER CONTACT", lastSub: "activité la plus récente",
    updated: "MIS À JOUR", locale: "fr-FR", label: "Radar de vol des contributions",
  },
};

async function fetchCalendar() {
  if (!token) throw new Error("GH_STATS_TOKEN or GITHUB_TOKEN is required");
  const query = `query($login: String!) { user(login: $login) { contributionsCollection {
    contributionCalendar { totalContributions weeks { contributionDays { date contributionCount weekday } } } } } }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
  });
  if (!res.ok) throw new Error(`GraphQL failed: ${res.status}`);
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error(`Unexpected GraphQL response: ${JSON.stringify(json).slice(0, 200)}`);
  return { total: cal.totalContributions, days: cal.weeks.flatMap((w) => w.contributionDays) };
}

const f = (n) => n.toFixed(1);
const fmt = (iso, locale, opts) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { timeZone: "UTC", ...opts });

function radar({ days }, lang, cx, cy, R) {
  const n = days.length;
  const max = Math.max(1, ...days.map((d) => d.contributionCount));
  const polar = (i, r) => {
    const a = (-90 + (i / n) * 360) * (Math.PI / 180);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  let out = "";
  // Rings and crosshair
  for (const k of [0.25, 0.5, 0.75, 1]) out += `<circle cx="${cx}" cy="${cy}" r="${f(R * k)}" fill="none" stroke="#1c2530" stroke-width="1.2"/>`;
  out += `<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="#1c2530" stroke-width="1"/><line x1="${cx}" y1="${cy - R}" x2="${cx}" y2="${cy + R}" stroke="#1c2530" stroke-width="1"/>`;
  // Month ticks and labels
  days.forEach((d, i) => {
    if (d.date.endsWith("-01")) {
      const [x1, y1] = polar(i, R);
      const [x2, y2] = polar(i, R + 6);
      const [lx, ly] = polar(i, R + 18);
      const month = fmt(d.date, COPY[lang].locale, { month: "short" }).replace(".", "").toUpperCase();
      out += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#30363d" stroke-width="1.5"/>`;
      out += `<text x="${f(lx)}" y="${f(ly + 3.5)}" text-anchor="middle" font-family="Courier New, monospace" font-size="10" fill="#8b98a5">${month}</text>`;
    }
  });
  // Quiet days as faint dots, active days as glowing blips
  let quiet = "", blips = "";
  days.forEach((d, i) => {
    const [x, y] = polar(i, R * (0.28 + 0.11 * d.weekday));
    if (d.contributionCount === 0) quiet += `<circle cx="${f(x)}" cy="${f(y)}" r="1.1"/>`;
    else {
      const s = Math.sqrt(d.contributionCount / max);
      const color = s > 0.6 ? "#ffb000" : "#00f5a0";
      blips += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(5 + 9 * s)}" fill="${color}" opacity="0.18"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(2.2 + 3.5 * s)}" fill="${color}"/>`;
    }
  });
  out += `<g fill="#26506b">${quiet}</g><g>${blips}</g>`;
  // Rotating sweep (static wedge with reduced motion)
  const [ex, ey] = [cx + R * Math.cos((-60 * Math.PI) / 180), cy + R * Math.sin((-60 * Math.PI) / 180)];
  const wedge = `<path d="M${cx} ${cy} L${cx} ${cy - R} A${R} ${R} 0 0 1 ${f(ex)} ${f(ey)} Z" fill="url(#sweep)"/><line x1="${cx}" y1="${cy}" x2="${f(ex)}" y2="${f(ey)}" stroke="#00f5a0" stroke-width="1.5" opacity="0.8"/>`;
  out += `<g class="motion">${wedge}<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="6s" repeatCount="indefinite"/></g>`;
  out += `<g class="still">${wedge}</g>`;
  out += `<circle cx="${cx}" cy="${cy}" r="3" fill="#00f5a0"/>`;
  return out;
}

function stats({ total, days }, lang, x, y, gap) {
  const c = COPY[lang];
  const peak = days.reduce((a, d) => (d.contributionCount > a.contributionCount ? d : a), days[0]);
  const active = days.filter((d) => d.contributionCount > 0);
  const last = active.length ? active[active.length - 1].date : null;
  const rows = [
    [c.total, String(total), c.totalSub],
    [c.peak, String(peak.contributionCount), c.peakSub(fmt(peak.date, c.locale, { day: "numeric", month: "short", year: "numeric" }))],
    [c.last, last ? fmt(last, c.locale, { day: "numeric", month: "short", year: "numeric" }).toUpperCase() : "—", c.lastSub],
  ];
  return rows.map(([label, value, sub], i) => `
  <g transform="translate(${x},${y + i * gap})">
    <text font-family="Courier New, monospace" font-size="11" letter-spacing="2" fill="#8b98a5">${label}</text>
    <text y="30" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="#ffb000">${value}</text>
    <text y="48" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#8b98a5">${sub}</text>
  </g>`).join("");
}

function svg(data, lang, mobile) {
  const c = COPY[lang];
  const W = mobile ? 380 : 900, H = mobile ? 690 : 380;
  const [cx, cy, R] = mobile ? [190, 262, 150] : [210, 190, 150];
  const updated = fmt(new Date().toISOString().slice(0, 10), c.locale, { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  const head = mobile
    ? `<text x="24" y="36" font-family="Courier New, monospace" font-size="14" font-weight="700" letter-spacing="3" fill="#00f5a0">${c.title}</text>
  <text x="24" y="56" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#8b98a5">${c.sub}</text>`
    : `<text x="430" y="62" font-family="Courier New, monospace" font-size="16" font-weight="700" letter-spacing="3" fill="#00f5a0">${c.title}</text>
  <text x="430" y="84" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#8b98a5">${c.sub}</text>`;
  const body = mobile ? stats(data, lang, 24, 458, 72) : stats(data, lang, 430, 128, 70);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${c.label}: ${data.total} ${c.totalSub}">
  <defs>
    <linearGradient id="frg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00f5a0" stop-opacity="0"/>
      <stop offset="1" stop-color="#00f5a0" stop-opacity="0.28"/>
    </linearGradient>
  </defs>
  <style>
    .still { display: none; }
    @media (prefers-reduced-motion: reduce) { .motion { display: none; } .still { display: inline; } }
  </style>
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="#0d1117" stroke="url(#frg)" stroke-width="2"/>
  ${head}
  ${radar(data, lang, cx, cy, R)}
  ${body}
  <text x="${W - 20}" y="${H - 16}" text-anchor="end" font-family="Courier New, monospace" font-size="9" letter-spacing="1" fill="#8b98a5">${c.updated} ${updated}</text>
</svg>
`;
}

const data = await fetchCalendar();
for (const lang of ["en", "fr"]) {
  const base = `../flight-radar${lang === "fr" ? ".fr" : ""}`;
  await writeFile(new URL(`${base}.svg`, import.meta.url), svg(data, lang, false));
  await writeFile(new URL(`${base}.mobile.svg`, import.meta.url), svg(data, lang, true));
}
console.log("flight radar updated", { total: data.total, days: data.days.length });
