import { Fragment } from "react"
import { isLocalized, type Rich, type RichText, type Text } from "@/content/types"

// Les deux langues sont rendues dans le HTML ; home.css masque celle qui ne correspond pas à data-lang.

/** Texte simple, éventuellement bilingue */
export function T({ v }: Readonly<{ v: Text }>) {
  if (!isLocalized(v)) return <>{v}</>
  return (
    <>
      <span className="i18n" lang="fr">
        {v.fr}
      </span>
      <span className="i18n" lang="en">
        {v.en}
      </span>
    </>
  )
}

function Segments({ rich }: Readonly<{ rich: Rich }>) {
  return (
    <>
      {rich.map((s, i) => (
        <Fragment key={i}>{typeof s === "string" ? s : "em" in s ? <em>{s.em}</em> : <strong>{s.strong}</strong>}</Fragment>
      ))}
    </>
  )
}

/** Texte riche (em / strong), éventuellement bilingue */
export function R({ v }: Readonly<{ v: RichText }>) {
  if (!isLocalized(v)) return <Segments rich={v} />
  return (
    <>
      <span className="i18n" lang="fr">
        <Segments rich={v.fr} />
      </span>
      <span className="i18n" lang="en">
        <Segments rich={v.en} />
      </span>
    </>
  )
}
