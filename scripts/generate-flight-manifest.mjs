const USERNAME = "Arjouan";
const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;

async function fetchRepo(name) {
  const res = await fetch(`https://api.github.com/repos/${USERNAME}/${name}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function checkLive(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

function cardSvg({ label, title, status, statusColor, subtitle, updated, idSuffix }) {
  const updatedText = updated ? `UPDATED ${updated}` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 130" width="420" role="img" aria-label="${title}: ${status} - ${subtitle}">
  <defs>
    <linearGradient id="mc-${idSuffix}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00c6ff"/>
      <stop offset="1" stop-color="#00f5a0"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="416" height="126" rx="14" fill="#0d1117" stroke="url(#mc-${idSuffix})" stroke-width="2"/>
  <text x="24" y="30" font-family="Courier New, monospace" font-size="11" letter-spacing="3" fill="#8b98a5">${label}</text>
  <text x="24" y="62" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#f0f6fc">${title}</text>
  <text x="24" y="86" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#8b98a5">${subtitle}</text>
  <line x1="24" y1="100" x2="396" y2="100" stroke="#30363d" stroke-width="1" stroke-dasharray="3 5"/>
  <text x="24" y="118" font-family="Courier New, monospace" font-size="11" font-weight="700" letter-spacing="1.5" fill="${statusColor}">STATUS: ${status}</text>
  <text x="396" y="118" text-anchor="end" font-family="Courier New, monospace" font-size="9" letter-spacing="0.5" fill="#8b98a5">${updatedText}</text>
</svg>
`;
}

const COLORS = { live: "#00f5a0", transit: "#00c6ff", packing: "#ffc857" };

async function buildPortfolioCard(lang) {
  const repo = await fetchRepo("Portfolio");
  const live = await checkLive("https://arjouan.github.io/Portfolio/");
  const updated = formatDate(repo?.pushed_at);

  const copy = lang === "fr"
    ? {
        label: "PROJET", title: "PORTFOLIO",
        live: "EN LIGNE", down: "BIENTÔT DISPONIBLE",
        subtitleLive: "Site personnel — prêt à l'atterrissage",
        subtitleDown: "Site personnel — actuellement en hangar",
      }
    : {
        label: "PROJECT", title: "PORTFOLIO",
        live: "LIVE", down: "BOARDING SOON",
        subtitleLive: "Personal site — cleared for landing",
        subtitleDown: "Personal site — currently in the hangar",
      };

  return cardSvg({
    label: copy.label,
    title: copy.title,
    status: live ? copy.live : copy.down,
    statusColor: live ? COLORS.live : COLORS.packing,
    subtitle: live ? copy.subtitleLive : copy.subtitleDown,
    updated,
    idSuffix: `pf-${lang}`,
  });
}

async function buildEpitechCard(lang) {
  const repos = await Promise.all(
    ["Epitech-Year-1-Projects", "Epitech-Year-2-Projects", "Epitech-Year-3-Projects"].map(fetchRepo)
  );
  const sizes = repos.map((r) => r?.size ?? 0);
  const nonEmptyCount = sizes.filter((s) => s > 0).length;
  const latestPush = repos
    .map((r) => r?.pushed_at)
    .filter(Boolean)
    .sort()
    .pop();
  const updated = formatDate(latestPush);

  let statusKey;
  if (nonEmptyCount === 0) statusKey = "packing";
  else if (nonEmptyCount < repos.length) statusKey = "transit";
  else statusKey = "live";

  const copy = lang === "fr"
    ? {
        label: "PROJET", title: "PROJETS EPITECH",
        packing: "EN PRÉPARATION", transit: "EN TRANSIT", live: "ENREGISTRÉ",
      }
    : {
        label: "PROJECT", title: "EPITECH COURSEWORK",
        packing: "PACKING CARGO", transit: "IN TRANSIT", live: "LOGGED",
      };

  return cardSvg({
    label: copy.label,
    title: copy.title,
    status: copy[statusKey],
    statusColor: COLORS[statusKey],
    subtitle: lang === "fr"
      ? "Projets du cursus ingénierie informatique, années 1 à 3"
      : "Core CS engineering curriculum, years 1–3",
    updated,
    idSuffix: `ep-${lang}`,
  });
}

async function main() {
  const fs = await import("node:fs/promises");
  const jobs = [
    ["flight-manifest-portfolio.svg", buildPortfolioCard("en")],
    ["flight-manifest-portfolio.fr.svg", buildPortfolioCard("fr")],
    ["flight-manifest-epitech.svg", buildEpitechCard("en")],
    ["flight-manifest-epitech.fr.svg", buildEpitechCard("fr")],
  ];
  for (const [filename, promise] of jobs) {
    const svg = await promise;
    await fs.writeFile(new URL(`../${filename}`, import.meta.url), svg);
    console.log(`wrote ${filename}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
