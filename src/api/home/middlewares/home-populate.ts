/**
 * `home-populate` middleware
 */

export default (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In home-populate middleware.');

    // Configuración para el populate en Strapi v5
    ctx.query = {
    	...ctx.query, // Mantén los query params existentes
      
    	populate: {
      	cover: {
          fields: ['name', 'width', 'height', 'alternativeText', 'url'], 
        },
         slider: {
           populate: {
             button: true,
             card: {
               fields: ['title', 'description'],
               populate: {
                 image: {
           	     	fields: ['name', 'width', 'height', 'alternativeText', 'url']
               	}
               } 
            	}
           }
         }
      },
      fields: ['title', 'description', 'categoriesTitle', 'productsTitle'], 
    }

    strapi.log.debug('Modified query:', ctx.query); // Debug: Verifica el query modificado

    await next();
  };
};
