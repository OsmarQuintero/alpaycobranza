export function resolveApiUrl(configuredApiUrl?: string): string {
  const fallbackLocal = 'http://localhost:8080/api';

  if (typeof window === 'undefined') {
    return configuredApiUrl || fallbackLocal;
  }

  const host = window.location.hostname;
  const protocol = window.location.protocol;

  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  const dynamic = isLocalhost
    ? fallbackLocal
    : protocol === 'https:'
      ? `https://${host}/api`
      : `http://${host}:8080/api`;

  if (!configuredApiUrl || configuredApiUrl === 'AUTO_HOST') {
    return dynamic;
  }

  return configuredApiUrl;
}
