/**
 * `reviews-populate` middleware
 */

export default (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In reviews-populate middleware.');

    ctx.query = {
      ...ctx.query, // Mantén los query params existentes
      populate: {
        rating: true
      },
      fields: ['title'] 
    };
    await next();
  };
};
