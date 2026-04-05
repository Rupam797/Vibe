import axios from "axios";
export const baseURL = "https://vibebackend-2zwg.onrender.com";
export const httpClient = axios.create({
  baseURL: baseURL,
});
