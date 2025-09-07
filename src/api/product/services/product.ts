/**
 * product service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::product.product', ({ strapi }) => ({
  async findBySlug(slug: string) {
    return await strapi.db.query('api::product.product').findOne({
      where: { slug },
      populate: {
        images: {
          fields: ['alternativeText', 'url'], 
        },
        categories: {
          fields: ['name', 'slug']
        }
      }
    });
  }
}));
