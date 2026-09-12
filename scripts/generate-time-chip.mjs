const CITIES = [
  { name: "MARSEILLE", tz: "Europe/Paris" },
  { name: "MONTREAL", tz: "America/Toronto" },
];

function timeParts(tz) {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(now);
  const offsetPart = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  })
    .formatToParts(now)
    .find((p) => p.type === "timeZoneName");
  const offset = offsetPart ? offsetPart.value.replace("GMT", "UTC") : "";
  return { time, day, offset };
}

function renderSvg(cities) {
  const cardWidth = 260;
  const width = cardWidth * cities.length;
  const cells = cities
    .map((c, i) => {
      const x = i * cardWidth;
      return `
    <g transform="translate(${x},0)">
      <line x1="0" y1="14" x2="0" y2="86" stroke="#30363d" stroke-width="${i === 0 ? 0 : 1.5}" stroke-dasharray="4 4"/>
      <text x="${cardWidth / 2}" y="34" text-anchor="middle" font-family="Courier New, monospace" font-size="11" letter-spacing="2" fill="#00f5a0">${c.name}</text>
      <text x="${cardWidth / 2}" y="63" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#f0f6fc">${c.time}</text>
      <text x="${cardWidth / 2}" y="80" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="#8b98a5">${c.day} · ${c.offset}</text>
    </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 100" width="100%" role="img" aria-label="Local time: ${cities.map((c) => `${c.name} ${c.time}`).join(", ")}">
  <defs>
    <linearGradient id="tcg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="${width - 4}" height="96" rx="14" fill="#0d1117" stroke="url(#tcg)" stroke-width="2"/>
  <text x="20" y="18" font-family="Courier New, monospace" font-size="10" letter-spacing="3" fill="#8b98a5">LOCAL TIME</text>
  ${cells}
</svg>
`;
}

async function main() {
  const cities = CITIES.map((c) => ({ name: c.name, ...timeParts(c.tz) }));
  const svg = renderSvg(cities);
  const fs = await import("node:fs/promises");
  await fs.writeFile(new URL("../time-chip.svg", import.meta.url), svg);
  console.log("time-chip.svg updated", cities);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
