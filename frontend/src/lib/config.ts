const DEFAULT_SERVER_URL = 'http://localhost:3000';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL?.trim() || DEFAULT_SERVER_URL;
export const API_BASE_URL = `${SERVER_URL.replace(/\/$/, '')}/api`;
