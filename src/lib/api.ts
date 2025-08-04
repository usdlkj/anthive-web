export const getApiBaseUrl = (): string => {
  const rawBase = typeof window === 'undefined'
    ? process.env.API_BASE
    : process.env.NEXT_PUBLIC_API_BASE;

  if (!rawBase) {
    throw new Error('API base URL is not defined in environment variables.');
  }

  const checkRaw = rawBase.endsWith('/') ? rawBase.substring(0, rawBase.length - 1) : rawBase;
  return checkRaw.endsWith('/api') ? checkRaw : `${checkRaw}/api`;
};