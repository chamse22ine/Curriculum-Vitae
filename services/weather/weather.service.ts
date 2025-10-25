import axios from "axios";
import type { WeatherData } from "@/types/weather.types";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const weatherService = {
  async getCurrentWeather(
    city?: string,
    country?: string
  ): Promise<WeatherData> {
    const cityName =
      city || process.env.NEXT_PUBLIC_OPENWEATHER_CITY || "Paris";
    const countryCode =
      country || process.env.NEXT_PUBLIC_OPENWEATHER_COUNTRY || "FR";

    try {
      const response = await axios.get<WeatherData>(BASE_URL, {
        params: {
          q: `${cityName},${countryCode}`,
          appid: API_KEY,
          units: "metric", // Pour Celsius
          lang: "fr", // Descriptions en français
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la météo:", error);
      throw new Error("Impossible de récupérer les données météo");
    }
  },

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get<WeatherData>(BASE_URL, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: "metric",
          lang: "fr",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la météo:", error);
      throw new Error("Impossible de récupérer les données météo");
    }
  },

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  },
};
