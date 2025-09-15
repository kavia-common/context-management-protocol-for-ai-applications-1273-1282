export const environment = {
  production: false,
  // IMPORTANT: runtime config supported via global injection if present on browser window.
  // PUBLIC_INTERFACE
  API_BASE_URL: (() => {
    try {
      // defer window access to runtime and guard for SSR
      // eslint-disable-next-line no-undef
      return typeof window !== 'undefined' && (window as any).__APP_API_BASE_URL__ ? (window as any).__APP_API_BASE_URL__ : '/api';
    } catch {
      return '/api';
    }
  })(),
  APP_TITLE: 'Model Context Protocol Dashboard'
};
