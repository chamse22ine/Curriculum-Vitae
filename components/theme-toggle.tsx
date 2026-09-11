"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

// Les icônes basculent en CSS (dark:) pour éviter un écart d'hydratation
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Basculer entre mode clair et mode sombre"
            className="text-ink-muted hover:text-ink"
        >
            <Sun className="size-4 dark:hidden" aria-hidden />
            <Moon className="hidden size-4 dark:block" aria-hidden />
        </Button>
    )
}
