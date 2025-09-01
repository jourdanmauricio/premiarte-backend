/**
 * `categories-populate` middleware
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    strapi.log.info('In categories-populate middleware.');

    // Configuración para el populate en Strapi v5
    ctx.query = {
      ...ctx.query, // Mantén los query params existentes
      populate: {
        image: {
          fields: ['alternativeText', 'url'], // Selecciona campos específicos de la imagen
        },
        products: {
          count: true, // Esto contará los productos relacionados
        }
      },
      fields: ['name', 'description', 'slug', 'featured'], // Campos de la categoría
    };

    strapi.log.debug('Modified query:', ctx.query); // Debug: Verifica el query modificado
    await next();
  };
};