export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // 'strapi::security',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': [
            "'self'", 
            "https:",
            // URLs específicas que están causando los errores CSP
            "https://api.github.com",
            "https://analytics.strapi.io",
          ],
          'img-src': [
            "'self'", 
            "data:", 
            "blob:", 
            "https://res.cloudinary.com",
            // Agregar market-assets para Strapi v5
            "market-assets.strapi.io",
          ],
          'media-src': [
            "'self'", 
            "data:", 
            "blob:", 
            "https://res.cloudinary.com"
          ],
          'script-src': [
            "'self'", 
            "'unsafe-inline'", 
            "'unsafe-eval'"
          ],
          'style-src': [
            "'self'", 
            "'unsafe-inline'"
          ],
          upgradeInsecureRequests: null,
        },
      },
      crossOriginEmbedderPolicy: false,
    },
  }
];