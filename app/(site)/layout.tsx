import type React from "react"
import { HomeShell } from "@/components/home/home-shell"
import { T } from "@/components/sections/text"
import { UI } from "@/content/copy"
import "./home.css"

// Groupe réservé à la page d'accueil : /calculator et /hours n'en font pas partie.
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <HomeShell>
      <main>{children}</main>
      <footer className="home-footer">
        <T v={UI.footer} />
      </footer>
    </HomeShell>
  )
}
