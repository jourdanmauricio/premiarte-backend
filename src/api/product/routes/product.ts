/**
 * product router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::product.product', {
  config: {
    findOne: {
      auth: false, // Opcional: configurar autenticación
      policies: [],
      middlewares: [],
    },
    find: {
      middlewares: ['api::product.products-populate'],
    }  
  } 
});
