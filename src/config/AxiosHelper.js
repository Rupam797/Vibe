import axios from "axios";
export const baseURL = import.meta.env.VITE_BACKEND_URL || "https://vibebackend-2zwg.onrender.com";
export const httpClient = axios.create({
  baseURL: baseURL,
});
