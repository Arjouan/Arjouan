const USERNAME = "Arjouan";
const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;

async function fetchFollowers() {
  const res = await fetch(`https://api.github.com/users/${USERNAME}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub user API failed: ${res.status}`);
  const user = await res.json();
  return user.followers ?? 0;
}

async function fetchProfileViews() {
  const res = await fetch(`https://komarev.com/ghpvc/?username=${USERNAME}&style=for-the-badge`);
  if (!res.ok) throw new Error(`komarev badge failed: ${res.status}`);
  const svg = await res.text();
  const match = svg.match(/aria-label="PROFILE VIEWS: (\d+)"/i);
  return match ? Number(match[1]) : null;
}

function renderSvg({ views, followers }) {
  const stats = [
    { label: "PROFILE VIEWS", value: views === null ? "—" : String(views) },
    { label: "FOLLOWERS", value: String(followers) },
  ];

  const cardWidth = 220;
  const width = cardWidth * stats.length;
  const cells = stats
    .map((s, i) => {
      const x = i * cardWidth;
      return `
    <g transform="translate(${x},0)">
      <line x1="0" y1="10" x2="0" y2="50" stroke="#30363d" stroke-width="${i === 0 ? 0 : 1.5}" stroke-dasharray="4 4"/>
      <text x="${cardWidth / 2}" y="24" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#f0f6fc">${s.value}</text>
      <text x="${cardWidth / 2}" y="42" text-anchor="middle" font-family="Courier New, monospace" font-size="10" letter-spacing="2" fill="#00f5a0">${s.label}</text>
    </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 60" width="100%" role="img" aria-label="${stats.map((s) => `${s.label}: ${s.value}`).join(", ")}">
  <defs>
    <linearGradient id="hsg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="${width - 4}" height="56" rx="12" fill="#0d1117" stroke="url(#hsg)" stroke-width="2"/>
  ${cells}
</svg>
`;
}

async function main() {
  const [followers, views] = await Promise.all([fetchFollowers(), fetchProfileViews()]);
  const svg = renderSvg({ views, followers });
  const fs = await import("node:fs/promises");
  await fs.writeFile(new URL("../header-stats.svg", import.meta.url), svg);
  console.log("header-stats.svg updated", { views, followers });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
