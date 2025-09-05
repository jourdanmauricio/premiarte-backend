/**
 * product controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;

    // Buscar por slug en lugar de ID
    const entity = await strapi.db.query('api::product.product').findOne({
      where: { slug: id },
      populate: {
        images: {
          fields: ['alternativeText', 'url'], 
        },
        categories: {
          fields: ['name', 'slug']
        }
      }
    });

    if (!entity) {
      return ctx.notFound('Producto no encontrado');
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  }
}));
