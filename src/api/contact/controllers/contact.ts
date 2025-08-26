/**
 * contact controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::contact.contact', ({ strapi }) => ({
  async create(ctx) {
    // 1. Ejecuta el create normal
    const response = await super.create(ctx);

    // 2. Obtiene los datos recién guardados
    const { data } = response;

    // 3. Enviar email
    try {
      await strapi.plugins['email'].services.email.send({
        to: 'jourdanmauricio@gmail.com',
        from: 'jourdanmauricio@gmail.com',
        subject: 'Nuevo mensaje recibido',
        text: `Se recibió un nuevo mensaje con ID: ${data.id}`,
        html: `<p>Se recibió un nuevo mensaje con ID: <b>${data.id}</b></p>`,
      });
    } catch (err) {
      strapi.log.error('Error enviando email', err);
    }

    return response;
  },
}));
