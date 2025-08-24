/**
 * `service-populate` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In service-populate middleware.');

    ctx.query = {
      ...ctx.query, // Mantén los query params existentes
      populate: {
        service: {
          populate: {
            image: {
              fields: ['alternativeText', 'url']
            }
          }
        }
      },
      fields: ['title', 'subtitle'] 
    };

    await next();
  };
};
