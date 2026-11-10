import { JOURNEY_HEAD } from "@/content/copy"
import { JOURNEY } from "@/content/journey"
import { Section } from "./section"
import { R, T } from "./text"

export function Journey() {
  return (
    <Section id="parcours" wide>
      <div className="eyebrow">
        <i />
        <span>
          <T v={JOURNEY_HEAD.eyebrow} />
        </span>
      </div>
      <h2>
        <R v={JOURNEY_HEAD.title} />
      </h2>
      <ul className="timeline">
        {JOURNEY.map((item, i) => (
          <li key={i}>
            <time>
              <T v={item.when} />
            </time>
            <div>
              <strong>
                <T v={item.title} />
              </strong>
              <span className="d">
                <T v={item.detail} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
