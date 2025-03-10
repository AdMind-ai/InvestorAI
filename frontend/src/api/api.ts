// src/api/api.ts
import axios from "axios";

const API_URL = "http://localhost:8000/api"; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});