export function resolveApiUrl(configuredApiUrl?: string): string {
  const fallback = 'http://localhost:8080/api';

  if (typeof window === 'undefined') {
    return configuredApiUrl || fallback;
  }

  const host = window.location.hostname;
  const dynamic = host === 'localhost' || host === '127.0.0.1'
    ? fallback
    : `http://${host}:8080/api`;

  if (!configuredApiUrl || configuredApiUrl === 'AUTO_HOST') {
    return dynamic;
  }

  return configuredApiUrl;
}

