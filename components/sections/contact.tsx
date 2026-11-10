import { CONTACT_HEAD } from "@/content/copy"
import { CONTACT } from "@/content/contact"
import { CopyEmail } from "./copy-email"
import { Section } from "./section"
import { R, T } from "./text"

export function Contact() {
  return (
    <Section id="contact">
      <div className="eyebrow">
        <i />
        <span>
          <T v={CONTACT_HEAD.eyebrow} />
        </span>
      </div>
      <h2>
        <R v={CONTACT_HEAD.title} />
      </h2>
      <div className="mail">
        <CopyEmail email={CONTACT.email} label={<T v={CONTACT_HEAD.copy} />} done={<T v={CONTACT_HEAD.copied} />} />
      </div>
      <div className="cta">
        {CONTACT.links.map((l) => (
          <a key={l.href} className="btn" href={l.href} target="_blank" rel="noopener">
            {l.label} ↗
          </a>
        ))}
      </div>
    </Section>
  )
}
