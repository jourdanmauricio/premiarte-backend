/**
 * product controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;
    
    // Si es un número, es un ID, usar controlador por defecto
    if (!isNaN(id) && !isNaN(parseFloat(id))) {
      return await super.findOne(ctx);
    }
    
    // Si no es un número, es un slug, usar el service
    const entity = await strapi.service('api::product.product').findBySlug(id);
    
    if (!entity) {
      return ctx.notFound('Producto no encontrado');
    }
    
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  }
}));
