import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Tailles de texte et ombres Papier & Signal : sans cette déclaration, tailwind-merge prend
// « text-h3 » ou « text-caption » pour des couleurs et les supprime devant « text-danger ».
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "lead", "body", "ui", "num-lg", "caption"],
      shadow: ["raise", "float", "lift"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
