export const APP_CONFIG = {
    name: 'JobsFabrica',
    description: 'AI-powered resume and cover letter builder',
    
    nav: {
      main: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Studio', href: '/studio' },
      ],
    },
    
    auth: {
      loginText: 'Login',
      logoutText: 'Logout',
    },
  } as const;
  
  export const ROUTES = {
    home: '/',
    dashboard: '/dashboard',
    studio: '/studio',
    login: '/login',
  } as const;