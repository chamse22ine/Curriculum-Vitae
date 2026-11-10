import { SKILLS } from "@/content/copy"
import { Section } from "./section"
import { R, T } from "./text"

/** Sections Web, Data, IA / MLOps et DevOps : même gabarit */
export function Skill({ id }: Readonly<{ id: keyof typeof SKILLS }>) {
  const s = SKILLS[id]
  return (
    <Section id={id}>
      <div className="eyebrow">
        <i />
        <span>
          <T v={s.eyebrow} />
        </span>
      </div>
      <h2>
        <R v={s.title} />
      </h2>
      <p>
        <T v={s.body} />
      </p>
      <ul className="stack">
        {s.stack.map((item, i) => (
          <li key={i}>
            <T v={item} />
          </li>
        ))}
      </ul>
      {s.proof && (
        <div className="proof">
          <R v={s.proof} />
        </div>
      )}
    </Section>
  )
}
