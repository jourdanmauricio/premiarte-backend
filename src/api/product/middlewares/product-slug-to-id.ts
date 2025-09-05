// src/api/product/middlewares/product-slug-to-id.ts
import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    strapi.log.info('Middleware product-slug-to-id iniciado');

    if (ctx.params.id && isNaN(Number(ctx.params.id))) {
      try {
        const slug = ctx.params.id;
        
        // Usar Entity Service en lugar de DB query para que el populate funcione igual
        const products = await strapi.entityService.findMany('api::product.product', {
          filters: { slug: slug },
          populate: {
            images: {
              fields: ['alternativeText', 'url']
            },
            categories: {
              fields: ['name', 'slug']
            }
          }
        });
        
        const product = products && products.length > 0 ? products[0] : null;
        
       
        if (product) {
          // Ya no necesitamos el map porque Entity Service respeta el populate con fields
          
          // Devolver el resultado directamente sin continuar al siguiente middleware
          ctx.body = {
            data: product,
            meta: {}
          };
          ctx.status = 200;
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