import { useState, useEffect } from "react";
import { weatherService } from "@/services/weather/weather.service";
import type { WeatherData } from "@/types/weather.types";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Essayer d'abord la géolocalisation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const data = await weatherService.getWeatherByCoords(
                  position.coords.latitude,
                  position.coords.longitude
                );
                setWeather(data);
              } catch (err) {
                // Fallback sur la ville par défaut
                const data = await weatherService.getCurrentWeather();
                setWeather(data);
              } finally {
                setLoading(false);
              }
            },
            async () => {
              // Si géolocalisation refusée, utiliser ville par défaut
              try {
                const data = await weatherService.getCurrentWeather();
                setWeather(data);
              } catch (err) {
                setError("Impossible de récupérer la météo");
              } finally {
                setLoading(false);
              }
            }
          );
        } else {
          // Pas de géolocalisation disponible
          const data = await weatherService.getCurrentWeather();
          setWeather(data);
          setLoading(false);
        }
      } catch (err) {
        setError("Erreur lors de la récupération de la météo");
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, loading, error };
}
