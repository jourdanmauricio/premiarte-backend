/**
 * product router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::product.product', {
  config: {
    findOne: {
      middlewares: [
        'api::product.product-slug-to-id', // Middleware para convertir slug a ID
      ],
    },
    find: {
      middlewares: ['api::product.products-populate'],
    }  
  } 
});
