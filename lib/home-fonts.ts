import { Instrument_Sans, JetBrains_Mono, Unbounded } from "next/font/google"

// Polices de la page d'accueil uniquement (le reste du site garde Geist / Instrument Serif).
// next/font génère des noms de famille hachés : le canvas doit utiliser `homeFonts.*.style.fontFamily`,
// jamais "Unbounded" ou "JetBrains Mono" en dur.

export const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-unbounded",
  display: "swap",
})

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

/** Classes à poser sur le conteneur de l'accueil pour définir les variables CSS */
export const homeFontVariables = `${unbounded.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`

/** Familles réelles (noms hachés + repli), transmises aux fonctions de dessin canvas via `env.fonts` */
export const homeFonts = {
  display: unbounded.style.fontFamily,
  sans: instrumentSans.style.fontFamily,
  mono: jetbrainsMono.style.fontFamily,
} as const

export type HomeFonts = typeof homeFonts
