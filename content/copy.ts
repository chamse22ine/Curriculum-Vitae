import { pick, type RichText, type Text } from "./types"

/** Section de compétence (Web, Data, IA, DevOps, Systèmes) */
export interface SkillCopy {
  eyebrow: Text
  title: RichText
  body: Text
  stack: readonly Text[]
  proof?: RichText
}

const nb = " " // espace insécable avant « : » et « ? »

export const HERO = {
  eyebrow: ["Chamseddine Adaadour", "Lille, France", { fr: "22 ans", en: "22 y/o" }] as readonly Text[],
  hey: { fr: "Hey, moi c'est Chams.", en: "Hey, I'm Chams." } as Text,
  title: {
    fr: ["Je construis des apps, ", { em: "du pixel au pipeline." }],
    en: ["I build apps, ", { em: "from pixel to pipeline." }],
  } as RichText,
  body: {
    fr: `Software Engineer en alternance chez Decathlon Digital et étudiant en Master Informatique à l'Université d'Artois. Web, data, IA, DevOps, apps natives${nb}: je prends un projet de l'interface jusqu'à la mise en production.`,
    en: "Software Engineer apprentice at Decathlon Digital and Computer Science Master's student at the University of Artois. Web, data, AI, DevOps, native apps: I take a project from the interface all the way to production.",
  } as Text,
  ctaProjects: { fr: "Voir les projets", en: "See the projects" } as Text,
  ctaContact: { fr: "Me contacter", en: "Get in touch" } as Text,
  hints: [
    {
      fr: `Fais défiler ou utilise ↑ ↓${nb}: la caméra voyage d'un univers à l'autre.`,
      en: "Scroll or press ↑ ↓: the camera travels from one world to the next.",
    },
    {
      fr: `Attrape les objets${nb}: glisse pour les tourner, clique pour les animer.`,
      en: "Grab the objects: drag to turn them, click to animate them.",
    },
  ] as readonly Text[],
}

export const SKILLS: Record<"web" | "data" | "ia" | "devops" | "systemes", SkillCopy> = {
  web: {
    eyebrow: { fr: "Développement web", en: "Web development" },
    title: {
      fr: ["Des interfaces que les gens ", { em: "utilisent vraiment" }, "."],
      en: ["Interfaces people ", { em: "actually use" }, "."],
    },
    body: {
      fr: "Chez Decathlon Digital, je développe sur MyClub, la plateforme e-commerce d'équipements sportifs personnalisés. À côté, je conçois des applications web et mobile de bout en bout.",
      en: "At Decathlon Digital I work on MyClub, the e-commerce platform for custom sports equipment. On the side, I design web and mobile apps end to end.",
    },
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js"],
    proof: {
      fr: [`À voir${nb}: `, { strong: "CultureX" }, ", ", { strong: "Site JPO" }, ", la ", { strong: "calculatrice de notes" }, "."],
      en: ["See: ", { strong: "CultureX" }, ", ", { strong: "Open-day site" }, ", the ", { strong: "grade calculator" }, "."],
    },
  },
  data: {
    eyebrow: "Data science",
    title: {
      fr: ["Transformer les données en ", { em: "solutions concrètes" }, "."],
      en: ["Turning data into ", { em: "concrete solutions" }, "."],
    },
    body: {
      fr: `Statistiques, nettoyage, exploration, modèles${nb}: je pars de données brutes pour arriver à quelque chose qu'on peut exploiter et expliquer.`,
      en: "Statistics, cleaning, exploration, models: I start from raw data and end with something you can use and explain.",
    },
    stack: ["Python", "SQL", "Pandas", "Scikit-learn", "Databricks", { fr: "Statistiques", en: "Statistics" }],
  },
  ia: {
    eyebrow: { fr: "IA & MLOps", en: "AI & MLOps" },
    title: {
      fr: ["Des modèles qui ", { em: "sortent du notebook" }, "."],
      en: ["Models that ", { em: "leave the notebook" }, "."],
    },
    body: {
      fr: `Ce qui m'intéresse, c'est rendre la data science industrialisable${nb}: entraîner un modèle, puis le déployer et le suivre dans le cloud.`,
      en: "What drives me is making data science production-ready: train a model, then deploy and monitor it in the cloud.",
    },
    stack: ["Machine learning", "MLOps", "Azure", "Databricks", "GCP"],
    proof: {
      fr: [`À voir${nb}: `, { strong: "FlightBot" }, ", chatbot déployé sur GCP, et le ", { strong: "Jeu de Siam" }, ", IA stratégique."],
      en: ["See: ", { strong: "FlightBot" }, ", a chatbot deployed on GCP, and ", { strong: "Siam" }, ", a strategy-game AI."],
    },
  },
  devops: {
    eyebrow: "DevOps & cloud",
    title: {
      fr: ["Livrer, mesurer, ", { em: "recommencer" }, "."],
      en: ["Ship, measure, ", { em: "repeat" }, "."],
    },
    body: {
      fr: `Conteneurs, intégration et déploiement continus, supervision${nb}: le code n'est fini que lorsqu'il tourne en production et qu'on sait comment il se porte.`,
      en: "Containers, continuous integration and delivery, monitoring: code is only done once it runs in production and you know how it's doing.",
    },
    stack: ["Docker", "GitHub Actions", "GCP", "Datadog", "Azure DevOps", "Git"],
    proof: {
      fr: ["Certifié ", { strong: "AZ-400" }, ", Enterprise DevOps Development."],
      en: [{ strong: "AZ-400" }, " certified, Enterprise DevOps Development."],
    },
  },
  systemes: {
    eyebrow: { fr: "Systèmes & apps natives", en: "Systems & native apps" },
    title: {
      fr: ["Du natif, ", { em: "au plus près du système" }, "."],
      en: ["Native code, ", { em: "close to the system" }, "."],
    },
    body: {
      fr: `Je développe aussi des applications de bureau pour Linux, en Rust avec GTK4 et libadwaita${nb}: des outils pensés pour Fedora et intégrés à GNOME.`,
      en: "I also build desktop applications for Linux, in Rust with GTK4 and libadwaita: tools designed for Fedora and integrated into GNOME.",
    },
    stack: ["Rust", "GTK4", "libadwaita", "C", "Linux"],
  },
}

export const PROJECTS_HEAD = {
  eyebrow: { fr: "Projets", en: "Projects" } as Text,
  title: { fr: ["Ce que ", { em: "j'ai construit" }, "."], en: ["What ", { em: "I've built" }, "."] } as RichText,
}

export const JOURNEY_HEAD = {
  eyebrow: { fr: "Parcours", en: "Journey" } as Text,
  title: { fr: ["D'où ", { em: "je viens" }, "."], en: ["Where ", { em: "I come from" }, "."] } as RichText,
}

export const CONTACT_HEAD = {
  eyebrow: "Contact" as Text,
  title: {
    fr: [`Un projet, une question${nb}? `, { em: "Écris-moi." }],
    en: ["A project, a question? ", { em: "Write to me." }],
  } as RichText,
  copy: { fr: "Copier", en: "Copy" } as Text,
  copied: { fr: "Copié", en: "Copied" } as Text,
}

/** Libellés d'interface (en-tête, pied de page) */
export const UI = {
  langLabel: "Changer de langue / Switch language",
  prevSection: "Section précédente / Previous section",
  nextSection: "Section suivante / Next section",
  navLabel: { fr: "Sections", en: "Sections" } as Text,
  footer: "© 2026 Chamseddine Adaadour" as Text,
}

export const META = {
  title: "Chams. Portfolio",
  description: pick(HERO.body, "fr"),
}

