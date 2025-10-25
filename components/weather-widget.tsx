"use client"

import { Card } from "@/components/ui/card"
import { Cloud, Droplets, Wind, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useWeather } from "@/components/useWeather"
import { weatherService } from "@/services/weather/weather.service"
import Image from "next/image"

export function WeatherWidget() {
    const { weather, loading, error } = useWeather()

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <Card className="glass-card p-6 border-primary/20">
                    <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-muted-foreground">Chargement de la météo...</p>
                    </div>
                </Card>
            </motion.div>
        )
    }

    if (error || !weather) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <Card className="glass-card p-6 border-destructive/20">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                        <p className="text-sm text-muted-foreground">{error || "Erreur inconnue"}</p>
                    </div>
                </Card>
            </motion.div>
        )
    }

    const temp = Math.round(weather.main.temp)
    const description = weather.weather[0]?.description || ""
    const iconCode = weather.weather[0]?.icon || "01d"

    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <Card className="glass-card p-6 border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="flex items-center justify-between">
                    {/* Partie gauche : Icône et température */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                            <Image
                                src={weatherService.getWeatherIconUrl(iconCode)}
                                alt={description}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-foreground">{temp}</span>
                                <span className="text-2xl text-muted-foreground">°C</span>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {weather.name}, {weather.sys.country}
                            </p>
                        </div>
                    </div>

                    {/* Partie droite : Détails */}
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-primary/70" />
                            <span className="text-muted-foreground">{weather.main.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-primary/70" />
                            <span className="text-muted-foreground">{Math.round(weather.wind.speed * 3.6)} km/h</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-primary/70" />
                            <span className="text-muted-foreground">{Math.round(weather.main.feels_like)}°C</span>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
