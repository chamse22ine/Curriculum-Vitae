import { CONTACT } from "@/content/contact"
import { LW, LH } from "../dims"
import { tx } from "../shared"
import type { ScreenApp } from "../types"
import { chrome, prompt } from "./chrome"

// 8 — Contact : `cat contact.json` dans un terminal
const CARD: [string, string][] = [
  ["name", CONTACT.name],
  ["email", CONTACT.email],
  ["github", CONTACT.links[0].handle],
  ["linkedin", CONTACT.links[1].handle],
  ["based", CONTACT.based],
]

export const appContact: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO } }) => {
  const tt = t % 14
  const f = `400 22px ${MONO}`
  const cmd = "cat contact.json"
  let y = 120
  x.fillStyle = "#140a16"
  x.fillRect(0, 0, LW, LH)
  chrome(x, "chams@dev: ~", SANS)
  const px = prompt(x, 40, y, f, "~")
  const typed = cmd.slice(0, Math.floor(tt * 14))
  tx(x, typed, px, y, f, "#ffffff")
  const cw = x.measureText("M").width
  let cx = px + typed.length * cw
  let cy = y
  const n = Math.floor((tt - 1.6) / 0.18)
  if (n > 0) {
    y += 52
    tx(x, "{", 40, y, f, "#b9b5d6")
    for (let i = 0; i < CARD.length && i < n - 1; i++) {
      y += 44
      const k = `  "${CARD[i][0]}"`
      tx(x, k, 40, y, f, "#ff7ab2")
      tx(x, ": ", 40 + k.length * cw, y, f, "#b9b5d6")
      tx(x, `"${CARD[i][1]}"${i < CARD.length - 1 ? "," : ""}`, 40 + (k.length + 2) * cw, y, f, "#ffd166")
    }
    if (n > CARD.length + 1) {
      y += 44
      tx(x, "}", 40, y, f, "#b9b5d6")
    }
    if (n > CARD.length + 3) {
      y += 60
      cx = prompt(x, 40, y, f, "~")
      cy = y
    } else cx = -99
  }
  if (Math.floor(t * 2) % 2 && cx > 0) {
    x.fillStyle = "#ffffff"
    x.fillRect(cx + 1, cy - 20, 13, 26)
  }
}
