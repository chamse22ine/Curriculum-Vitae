"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/** Adresse e-mail + bouton « Copier » ; si le presse-papiers est refusé, l'adresse est sélectionnée */
export function CopyEmail({ email, label, done }: Readonly<{ email: string; label: ReactNode; done: ReactNode }>) {
  const code = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(id)
  }, [copied])

  const select = () => {
    if (!code.current) return
    const range = document.createRange()
    range.selectNodeContents(code.current)
    const sel = getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  const copy = () => {
    try {
      navigator.clipboard.writeText(email).then(() => setCopied(true), select)
    } catch {
      select()
    }
  }

  return (
    <>
      <code ref={code}>{email}</code>
      <button className="btn main" type="button" onClick={copy}>
        {copied ? done : label}
      </button>
    </>
  )
}
