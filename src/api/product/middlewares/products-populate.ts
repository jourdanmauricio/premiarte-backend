/**
 * `products-populate` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In products-populate middleware.');

    if (ctx.state.route?.handler === 'api::product.product.find' || 
        ctx.state.route?.handler === 'api::product.product.findOne') {
      ctx.query = {
        ...ctx.query, // Mantén los query params existentes
        populate: {
          images: {
            fields: ['alternativeText', 'url'], 
          },
          categories: {
            fields: ['name', 'slug']
          }
        }
      };
    }

    await next();
  };
};
