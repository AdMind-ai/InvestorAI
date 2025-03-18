type FetchOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: BodyInit | null;
};

const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_PROD;

export const fetchWithAuth = (endpoint: string, options: FetchOptions = {}) => {
    const token = localStorage.getItem("access");
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(`${baseURL}${endpoint}`, { ...options, headers });
};