// Shared by generate-project-cards.mjs and generate-social-previews.mjs.
// repo: GitHub repository name, used for links and social preview file names.
export const PROJECTS = [
  {
    slug: "meridian", repo: "Meridian", title: "MERIDIAN", flight: "AJ-01", status: "boarding",
    gate: { en: "PERSONAL", fr: "PERSO" },
    desc: {
      en: "Vessel Management System for maritime logistics, built end to end",
      fr: "Gestion de flotte pour la logistique maritime, développée de A à Z",
    },
    stack: "NESTJS · PRISMA · POSTGIS · NEXT.JS",
  },
  {
    slug: "rtype", repo: "rtype", title: "R-TYPE", flight: "AJ-02", status: "landed",
    gate: { en: "EPITECH Y3", fr: "EPITECH A3" },
    desc: {
      en: "Authoritative multiplayer remake with a custom ECS and UDP protocol",
      fr: "Remake multijoueur autoritaire, ECS maison et protocole binaire UDP",
    },
    stack: "C++20 · SFML",
  },
  {
    slug: "area", repo: "area", title: "AREA", flight: "AJ-03", status: "landed",
    gate: { en: "EPITECH Y3", fr: "EPITECH A3" },
    desc: {
      en: "IFTTT-style automation platform with OAuth integrations and hooks",
      fr: "Plateforme d'automatisation façon IFTTT, intégrations OAuth et hooks",
    },
    stack: "FASTAPI · VUE · ANDROID",
  },
  {
    slug: "zappy", repo: "zappy", title: "ZAPPY", flight: "AJ-04", status: "landed",
    gate: { en: "EPITECH Y2", fr: "EPITECH A2" },
    desc: {
      en: "Multiplayer network game: server, AI client and 2D GUI",
      fr: "Jeu en réseau multijoueur : serveur, IA client et interface 2D",
    },
    stack: "C · C++",
  },
];
