export const environment = {
  production: true,
  // PUBLIC_INTERFACE
  API_BASE_URL: (() => {
    try {
      // eslint-disable-next-line no-undef
      return typeof window !== 'undefined' && (window as any).__APP_API_BASE_URL__ ? (window as any).__APP_API_BASE_URL__ : '/api';
    } catch {
      return '/api';
    }
  })(),
  APP_TITLE: 'Model Context Protocol Dashboard'
};
