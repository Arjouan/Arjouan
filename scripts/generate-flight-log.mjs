const USERNAME = "Arjouan";
const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;

async function restGet(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`REST ${path} failed: ${res.status}`);
  return res.json();
}

async function fetchRestStats() {
  const user = await restGet(`/users/${USERNAME}`);
  let stars = 0;
  let page = 1;
  while (true) {
    const repos = await restGet(`/users/${USERNAME}/repos?per_page=100&page=${page}`);
    if (!Array.isArray(repos) || repos.length === 0) break;
    stars += repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    if (repos.length < 100) break;
    page += 1;
  }
  return { repos: user.public_repos ?? 0, followers: user.followers ?? 0, stars };
}

async function fetchContributions() {
  if (!process.env.GH_STATS_TOKEN) return null;
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar { totalContributions }
        }
      }
    }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GH_STATS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? null;
}

function renderSvg({ repos, stars, contributions }) {
  const flightHours = contributions === null ? "—" : String(contributions);
  const stats = [
    { label: "DESTINATIONS", sub: "public repos", value: String(repos) },
    { label: "STARS COLLECTED", sub: "across repos", value: String(stars) },
    { label: "FLIGHT HOURS", sub: "contributions / yr", value: flightHours },
  ];

  const cardWidth = 200;
  const cells = stats
    .map((s, i) => {
      const x = i * cardWidth;
      return `
    <g transform="translate(${x},0)">
      <line x1="0" y1="14" x2="0" y2="106" stroke="#30363d" stroke-width="${i === 0 ? 0 : 1.5}" stroke-dasharray="4 4"/>
      <text x="${cardWidth / 2}" y="46" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#f0f6fc">${s.value}</text>
      <text x="${cardWidth / 2}" y="70" text-anchor="middle" font-family="Courier New, monospace" font-size="11" letter-spacing="2" fill="#00f5a0">${s.label}</text>
      <text x="${cardWidth / 2}" y="88" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="#8b98a5">${s.sub}</text>
    </g>`;
    })
    .join("");

  const width = cardWidth * stats.length;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 120" width="100%" role="img" aria-label="Flight log stats: ${stats.map((s) => `${s.value} ${s.label}`).join(", ")}">
  <defs>
    <linearGradient id="flg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="0.5" stop-color="#0072ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="${width - 4}" height="116" rx="14" fill="#0d1117" stroke="url(#flg)" stroke-width="2"/>
  <text x="20" y="18" font-family="Courier New, monospace" font-size="10" letter-spacing="3" fill="#8b98a5">FLIGHT LOG</text>
  ${cells}
</svg>
`;
}

async function main() {
  const rest = await fetchRestStats();
  const contributions = await fetchContributions();
  const svg = renderSvg({ ...rest, contributions });
  const fs = await import("node:fs/promises");
  await fs.writeFile(new URL("../flight-log.svg", import.meta.url), svg);
  console.log("flight-log.svg updated", { ...rest, contributions });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
