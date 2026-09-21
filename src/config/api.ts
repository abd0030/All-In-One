const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_AI_BACKEND_URL || '';

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) return cleanPath;
  return `${API_BASE_URL.replace(/\/$/, '')}${cleanPath}`;
};
