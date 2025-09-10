```sh
npm run develop
```

# Generate the Strapi API and routes

## Generate Middleware
```sh
npm run strapi generate
> middleware
services-populate
> Add middleware to an existing API
> product
```

## Ver lista de middlewares
```sh
npm run strapi middlewares:list
```

```ts
/**
 * `products-populate` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In products-populate middleware.');

    ctx.query = {
      ...ctx.query, // Mantén los query params existentes
      populate: {
        image: {
          fields: ['alternativeText', 'url'], // Selecciona campos específicos de la imagen
        },
      },
      fields: ['name', 'description', 'slug', 'featured'], // Campos de la categoría
    };

    await next();
  };
};
```
```ts
/**
 * product router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::product.product', {
  config: {
    find: {
      middlewares: ['api::product.products-populate'],
    }  
  } 
});
```


# DOCKER
--------

# Para desarrollo con reconstrucción
docker-compose -f docker-compose.dev.yml up --build

# Para producción
docker-compose -f docker-compose.prod.yml up --build -d


# 1. Construir y ejecutar por primera vez
docker-compose up --build

# 2. Hacer cambios en tu código...
# (Los cambios se reflejan automáticamente gracias al volumen)

# 3. Si agregas nuevas dependencias:
# Editar package.json -> luego:
docker-compose up --build

# 4. Si modificas el Dockerfile:
docker-compose up --build

# 5. Para detener:
docker-compose down

# 6. Para eliminar todo incluyendo volúmenes (¡cuidado!):
docker-compose down -v


# Creación de plugin
--------------------

npx @strapi/sdk-plugin@latest init premiarte-manager
