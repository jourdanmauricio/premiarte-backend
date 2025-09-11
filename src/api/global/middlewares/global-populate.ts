/**
 * `global-populate` middleware
 */

const populate = {
    favicon: {
      fields: ["alternativeText", "url"]
    },
    defaultSeo: {
      populate: {
        shareImage: {
          fields: ["alternativeText", "url"]
        }
      }
    },
    banner: {
      populate: {
        link: true
      }
    },
    header: {
      populate: {
        logo: {
          populate: {
            image: {
              fields: ["alternativeText", "url"]
            }
          }
        },
      }
    },
    footer: {
      populate: {
        logo: {
          populate: {
            image: {
              fields: ["alternativeText", "url"]
            }
          }
        },
        socialLinks: {
          populate: {
            image: {
              fields: ["alternativeText", "url"] 
            } 
          }
        },
        design: true
      }
    }
  };

export default (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In global-populate middleware.');
    ctx.query.populate = populate;
    await next();
  };
};
