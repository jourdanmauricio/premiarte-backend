/**
 * product router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::product.product', {
  config: {
    findOne: {
      middlewares: ['api::product.products-populate'],
    },
    find: {
      middlewares: ['api::product.products-populate'],
    }  
  } 
});
