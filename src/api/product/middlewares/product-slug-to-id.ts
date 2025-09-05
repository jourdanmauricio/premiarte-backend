// src/api/product/middlewares/product-slug-to-id.ts
import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    strapi.log.info('Middleware product-slug-to-id iniciado');

    if (ctx.params.id && isNaN(Number(ctx.params.id))) {
      try {
        const slug = ctx.params.id;
        console.log('Buscando producto con slug:', slug);
        
        // Hacer la consulta completa directamente aquí
        const product = await strapi.db.query('api::product.product').findOne({
          where: { slug: slug },
          populate: {
            images: {
              fields: ['alternativeText', 'url'], 
            },
            categories: {
              fields: ['name', 'slug']
            }
          }
        });
        
        console.log('Producto encontrado:', product ? 'SÍ' : 'NO');
        
        if (product) {
          // Devolver el resultado directamente sin continuar al siguiente middleware
          ctx.body = {
            data: product,
            meta: {}
          };
          ctx.status = 200;
          console.log('Respuesta enviada directamente desde middleware');
          return; // No llamar a next()
        } else {
          console.log('Producto no encontrado con slug:', slug);
          return ctx.notFound('Producto no encontrado');
        }
      } catch (error) {
        console.error('Error en middleware:', error);
        strapi.log.error('Error en middleware slug-to-id:', error);
        return ctx.badRequest('Error al procesar la solicitud');
      }
    } else {
      console.log('ID es numérico, continuar normalmente');
      // Para IDs numéricos, continuar con el flujo normal
      await next();
    }
  };
};