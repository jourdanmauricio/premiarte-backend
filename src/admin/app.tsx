import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      'es', 'en'
    ],
    tutorials: false,
    notifications: { releases: false },
    translations: {
      en: {
        "premiarte-manager.plugin.name": "Gestión Premiarte"
      },
      es: {
        "premiarte-manager.plugin.name": "Gestión Premiarte",
        "content-manager.plugin.name": "Gestión Premiarte",
      }
    },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
