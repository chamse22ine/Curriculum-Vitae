import type React from "react"
import { SiteHeader } from "@/components/site/site-header"

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div lang="en" className="relative min-h-dvh">
      <SiteHeader />
      {children}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-ui text-ink-muted">© {new Date().getFullYear()} Chamseddine Adaadour</p>
          <p className="num text-caption text-ink-muted">Built with Next.js &amp; Tailwind</p>
        </div>
      </footer>
    </div>
  )
}
