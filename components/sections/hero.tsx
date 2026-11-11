import { HERO } from "@/content/copy"
import { Section } from "./section"
import { R, T } from "./text"

export function Hero() {
  return (
    <Section id="top" wide>
      <div className="eyebrow">
        {HERO.eyebrow.map((e, i) => (
          <span key={i}>
            <T v={e} />
          </span>
        ))}
      </div>
      <div className="hey">
        <T v={HERO.hey} />
      </div>
      <h1>
        <R v={HERO.title} />
      </h1>
      <p>
        <T v={HERO.body} />
      </p>
      <div className="cta">
        <a className="btn main" href="#projets">
          <T v={HERO.ctaProjects} />
        </a>
        <a className="btn" href="#contact">
          <T v={HERO.ctaContact} />
        </a>
      </div>
      {HERO.hints.map((h, i) => (
        <div className="hint" key={i}>
          <T v={h} />
        </div>
      ))}
    </Section>
  )
}
