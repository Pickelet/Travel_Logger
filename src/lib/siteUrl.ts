const normalizeUrl = (value: string): string => value.replace(/\/+$/, '');

export const getSiteUrl = (): string => {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim();
  if (fromEnv) {
    return normalizeUrl(fromEnv);
  }

  if (typeof window !== 'undefined') {
    return normalizeUrl(window.location.origin);
  }

  return '';
};
