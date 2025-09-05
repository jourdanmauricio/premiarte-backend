/**
 * product controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;
    
    // Buscar por slug en lugar de ID
    const entity = await strapi.db.query('api::articulo.articulo').findOne({
      where: { slug: id },
      populate: ['imagen', 'categoria'] // Ajusta los campos que necesites
    });

    if (!entity) {
      return ctx.notFound('Artículo no encontrado');
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  }
}));
