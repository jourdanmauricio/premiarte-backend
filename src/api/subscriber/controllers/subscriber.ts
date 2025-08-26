/**
 * subscriber controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::subscriber.subscriber', ({ strapi }) => ({
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
        subject: 'Nuevo suscriptor recibido',
        text: `Se recibió un nuevo suscriptor con ID: ${data.id}`,
        html: `<p>Se recibió un nuevo suscriptor con ID: <b>${data.id}</b></p>`,
      });
    } catch (err) {
      strapi.log.error('Error enviando email', err);
    }

    return response;
  },
}));
