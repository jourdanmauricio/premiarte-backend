import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductPricesDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { categoryIds, images, relatedProductIds, variationTypeIds, ...productData } = createProductDto;

    // Verificar que el slug no exista
    const existingProduct = await this.prisma.client.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existingProduct) {
      throw new BadRequestException('Ya existe un producto con este slug');
    }

    // Verificar SKU único si se proporciona
    if (productData.sku) {
      const existingSku = await this.prisma.client.product.findUnique({
        where: { sku: productData.sku },
      });

      if (existingSku) {
        throw new BadRequestException('Ya existe un producto con este SKU');
      }
    }

    // Verificar que las categorías existen
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.prisma.client.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('Una o más categorías no existen');
      }
    }

    // Verificar que las imágenes existen
    if (images && images.length > 0) {
      const existingImages = await this.prisma.client.image.findMany({
        where: { id: { in: images } },
      });

      if (existingImages.length !== images.length) {
        throw new BadRequestException('Una o más imágenes no existen');
      }
    }

    // Verificar que los productos relacionados existen
    if (relatedProductIds && relatedProductIds.length > 0) {
      const relatedProducts = await this.prisma.client.product.findMany({
        where: { id: { in: relatedProductIds } },
      });

      if (relatedProducts.length !== relatedProductIds.length) {
        throw new BadRequestException('Uno o más productos relacionados no existen');
      }
    }

    // Verificar que los tipos de variación existen
    if (variationTypeIds && variationTypeIds.length > 0) {
      const types = await this.prisma.client.variationType.findMany({
        where: { id: { in: variationTypeIds } },
      });
      if (types.length !== variationTypeIds.length) {
        throw new BadRequestException('Uno o más tipos de variación no existen');
      }
    }

    // Crear el producto con sus relaciones y variante default
    const product = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...productData,
          categories:
            categoryIds && categoryIds.length > 0
              ? {
                  create: categoryIds.map((categoryId) => ({
                    categoryId,
                  })),
                }
              : undefined,
          images:
            images && images.length > 0
              ? {
                  create: images.map((imageId, index) => ({
                    imageId,
                    orderIndex: index,
                    isPrimary: index === 0,
                  })),
                }
              : undefined,
          relatedFrom:
            relatedProductIds && relatedProductIds.length > 0
              ? {
                  create: relatedProductIds.map((relatedProductId) => ({
                    relatedProductId,
                  })),
                }
              : undefined,
        },
      });

      // Todo producto tiene al menos una variante default
      const variantSku = productData.sku ?? `P-${created.id}`;
      await tx.productVariant.create({
        data: {
          productId: created.id,
          sku: variantSku,
          stock: created.stock,
          retailPrice: created.retailPrice,
          wholesalePrice: created.wholesalePrice,
          isDefault: true,
        },
      });

      if (variationTypeIds && variationTypeIds.length > 0) {
        await tx.productVariationType.createMany({
          data: variationTypeIds.map((variationTypeId) => ({
            productId: created.id,
            variationTypeId,
          })),
        });
      }

      return created;
    });

    return this.findOne(product.id);
  }

  async findAll(options?: { isActive?: boolean; isFeatured?: boolean; category?: string; page?: string }) {
    const where = {
      isActive: options?.isActive,
      isFeatured: options?.isFeatured,
      ...(options?.category && {
        categories: { some: { category: { slug: options.category } } },
      }),
    };

    const select = {
      id: true,
      name: true,
      description: true,
      stock: true,
      isActive: true,
      isFeatured: true,
      retailPrice: true,
      wholesalePrice: true,
      slug: true,
      sku: true,
      priceUpdatedAt: true,
      priceUpdated: true,
      categories: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              imageId: true,
              featured: true,
            },
          },
        },
      },
      images: {
        select: {
          image: {
            select: {
              id: true,
              url: true,
              alt: true,
              tag: true,
              publicId: true,
            },
          },
        },
        orderBy: { orderIndex: 'asc' as const },
      },
      relatedFrom: {
        select: { relatedProductId: true },
      },
      variants: {
        select: {
          id: true,
          sku: true,
          stock: true,
          retailPrice: true,
          wholesalePrice: true,
          isDefault: true,
          values: {
            select: {
              variationTypeValue: {
                select: {
                  id: true,
                  value: true,
                  variationType: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { isDefault: 'desc' as const },
      },
      variationTypes: {
        select: {
          variationType: { select: { id: true, name: true } },
        },
      },
    };

    const isPaginated = options?.page !== undefined && options?.page !== '';

    if (!isPaginated) {
      const products = await this.prisma.client.product.findMany({
        where,
        select,
        orderBy: { createdAt: 'desc' },
      });
      const data = products.map(({ relatedFrom, ...product }) =>
        this.withVariantTotals({
          ...product,
          categories: product.categories.map((pc) => pc.category),
          images: product.images.map((pi) => pi.image),
          relatedProducts: relatedFrom.map((r) => r.relatedProductId),
        }),
      );
      const total = data.length;
      return {
        data,
        total,
        page: 1,
        limit: total,
        totalPages: 1,
      };
    }

    const page = parseInt(options.page!, 10);
    const limit = 9;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.client.product.findMany({
        where,
        skip,
        take: limit,
        select,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.product.count({ where }),
    ]);

    const data = products.map(({ relatedFrom, ...product }) =>
      this.withVariantTotals({
        ...product,
        categories: product.categories.map((pc) => pc.category),
        images: product.images.map((pi) => pi.image),
        relatedProducts: relatedFrom.map((r) => r.relatedProductId),
      }),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.client.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: {
              include: { image: true },
            },
          },
        },
        images: {
          include: { image: true },
          orderBy: { orderIndex: 'asc' },
        },
        relatedFrom: {
          include: {
            relatedProduct: {
              include: {
                images: {
                  where: { isPrimary: true },
                  include: { image: true },
                  take: 1,
                },
              },
            },
          },
        },
        variants: {
          include: {
            values: {
              include: {
                variationTypeValue: {
                  include: { variationType: true },
                },
              },
            },
          },
          orderBy: { isDefault: 'desc' },
        },
        variationTypes: {
          include: { variationType: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.withVariantTotals(product);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { slug },
      include: {
        categories: {
          include: {
            category: {
              include: { image: true },
            },
          },
        },
        images: {
          include: { image: true },
          orderBy: { orderIndex: 'asc' as const },
        },
        relatedFrom: {
          include: {
            relatedProduct: {
              include: {
                images: {
                  where: { isPrimary: true },
                  include: { image: true },
                  take: 1,
                },
              },
            },
          },
        },
        variants: {
          include: {
            values: {
              include: {
                variationTypeValue: {
                  include: { variationType: true },
                },
              },
            },
          },
          orderBy: { isDefault: 'desc' },
        },
        variationTypes: {
          include: { variationType: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const withCategories = {
      ...product,
      categories: product.categories.map((pc) => pc.category),
      images: product.images.map((pi) => pi.image),
    };
    return this.withVariantTotals(withCategories);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Verificar que el producto existe
    await this.findOne(id);

    const { categoryIds, images, relatedProductIds, variationTypeIds, ...productData } = updateProductDto;

    // Verificar slug único si se actualiza
    if (productData.slug) {
      const existingProduct = await this.prisma.client.product.findFirst({
        where: {
          slug: productData.slug,
          id: { not: id },
        },
      });

      if (existingProduct) {
        throw new BadRequestException('Ya existe un producto con este slug');
      }
    }

    // Verificar SKU único si se actualiza
    if (productData.sku) {
      const existingSku = await this.prisma.client.product.findFirst({
        where: {
          sku: productData.sku,
          id: { not: id },
        },
      });

      if (existingSku) {
        throw new BadRequestException('Ya existe un producto con este SKU');
      }
    }

    // Verificar categorías
    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        const categories = await this.prisma.client.category.findMany({
          where: { id: { in: categoryIds } },
        });

        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('Una o más categorías no existen');
        }
      }
    }

    // Verificar imágenes
    if (images !== undefined) {
      if (images.length > 0) {
        const existingImages = await this.prisma.client.image.findMany({
          where: { id: { in: images } },
        });

        if (existingImages.length !== images.length) {
          throw new BadRequestException('Una o más imágenes no existen');
        }
      }
    }

    // Verificar productos relacionados
    if (relatedProductIds !== undefined) {
      if (relatedProductIds.length > 0) {
        // No puede relacionarse consigo mismo
        if (relatedProductIds.includes(id)) {
          throw new BadRequestException('Un producto no puede estar relacionado consigo mismo');
        }

        const relatedProducts = await this.prisma.client.product.findMany({
          where: { id: { in: relatedProductIds } },
        });

        if (relatedProducts.length !== relatedProductIds.length) {
          throw new BadRequestException('Uno o más productos relacionados no existen');
        }
      }
    }

    // Verificar tipos de variación
    if (variationTypeIds !== undefined && variationTypeIds.length > 0) {
      const types = await this.prisma.client.variationType.findMany({
        where: { id: { in: variationTypeIds } },
      });
      if (types.length !== variationTypeIds.length) {
        throw new BadRequestException('Uno o más tipos de variación no existen');
      }
    }

    // Actualizar el producto usando una transacción
    return this.prisma.client
      .$transaction(async (tx) => {
        // Actualizar datos básicos del producto
        await tx.product.update({
          where: { id },
          data: {
            ...productData,
            priceUpdatedAt: productData.retailPrice !== undefined || productData.wholesalePrice !== undefined ? new Date() : undefined,
          },
        });

        // Actualizar categorías si se proporcionan
        if (categoryIds !== undefined) {
          // Eliminar relaciones existentes
          await tx.productCategory.deleteMany({
            where: { productId: id },
          });

          // Crear nuevas relaciones
          if (categoryIds.length > 0) {
            await tx.productCategory.createMany({
              data: categoryIds.map((categoryId) => ({
                productId: id,
                categoryId,
              })),
            });
          }
        }

        // Actualizar imágenes si se proporcionan
        if (images !== undefined) {
          // Eliminar relaciones existentes
          await tx.productImage.deleteMany({
            where: { productId: id },
          });

          // Crear nuevas relaciones (la primera imagen es la principal)
          if (images.length > 0) {
            await tx.productImage.createMany({
              data: images.map((imageId, index) => ({
                productId: id,
                imageId,
                orderIndex: index,
                isPrimary: index === 0,
              })),
            });
          }
        }

        // Actualizar productos relacionados si se proporcionan
        if (relatedProductIds !== undefined) {
          // Eliminar relaciones existentes
          await tx.productRelated.deleteMany({
            where: { productId: id },
          });

          // Crear nuevas relaciones
          if (relatedProductIds.length > 0) {
            await tx.productRelated.createMany({
              data: relatedProductIds.map((relatedProductId) => ({
                productId: id,
                relatedProductId,
              })),
            });
          }
        }

        // Actualizar tipos de variación si se proporcionan
        if (variationTypeIds !== undefined) {
          await tx.productVariationType.deleteMany({
            where: { productId: id },
          });
          if (variationTypeIds.length > 0) {
            await tx.productVariationType.createMany({
              data: variationTypeIds.map((variationTypeId) => ({
                productId: id,
                variationTypeId,
              })),
            });
          }
        }

        // Retornar el producto actualizado con todas sus relaciones
        const updated = await tx.product.findUnique({
          where: { id },
          include: {
            categories: {
              include: { category: true },
            },
            images: {
              include: { image: true },
              orderBy: { orderIndex: 'asc' },
            },
            relatedFrom: {
              include: { relatedProduct: true },
            },
            variants: {
              include: {
                values: {
                  include: {
                    variationTypeValue: {
                      include: { variationType: true },
                    },
                  },
                },
              },
              orderBy: { isDefault: 'desc' },
            },
            variationTypes: {
              include: { variationType: true },
            },
          },
        });
        return updated!;
      })
      .then((p) => this.withVariantTotals(p));
  }

  async updateProductPrices(updateProductPricesDto: UpdateProductPricesDto) {
    const { products, percentage, operation } = updateProductPricesDto;

    for (const productId of products) {
      const product = await this.findOne(productId);

      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }

      if (operation === 'add') {
        product.retailPrice = product.retailPrice + (product.retailPrice * percentage) / 100;
        product.wholesalePrice = product.wholesalePrice + (product.wholesalePrice * percentage) / 100;
      } else {
        product.retailPrice = product.retailPrice - (product.retailPrice * percentage) / 100;
        product.wholesalePrice = product.wholesalePrice - (product.wholesalePrice * percentage) / 100;
      }

      await this.update(productId, {
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        priceUpdatedAt: new Date(),
        priceUpdated: `${operation === 'add' ? 'Inc' : 'Dec'} ${percentage}%`,
      });
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.product.delete({
      where: { id },
    });
  }

  // Métodos adicionales para gestión de relaciones

  async addCategory(productId: number, categoryId: number) {
    const product = await this.findOne(productId);

    const category = await this.prisma.client.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar si ya existe la relación
    const existing = await this.prisma.client.productCategory.findUnique({
      where: {
        productId_categoryId: { productId, categoryId },
      },
    });

    if (existing) {
      throw new BadRequestException('El producto ya tiene esta categoría asignada');
    }

    await this.prisma.client.productCategory.create({
      data: { productId, categoryId },
    });

    return this.findOne(product.id);
  }

  async removeCategory(productId: number, categoryId: number) {
    await this.findOne(productId);

    const relation = await this.prisma.client.productCategory.findUnique({
      where: {
        productId_categoryId: { productId, categoryId },
      },
    });

    if (!relation) {
      throw new NotFoundException('El producto no tiene esta categoría asignada');
    }

    await this.prisma.client.productCategory.delete({
      where: { id: relation.id },
    });

    return this.findOne(productId);
  }

  async addImage(productId: number, imageId: number, orderIndex = 0, isPrimary = false) {
    const product = await this.findOne(productId);

    const image = await this.prisma.client.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    // Verificar si ya existe la relación
    const existing = await this.prisma.client.productImage.findUnique({
      where: {
        productId_imageId: { productId, imageId },
      },
    });

    if (existing) {
      throw new BadRequestException('El producto ya tiene esta imagen asignada');
    }

    // Si es la imagen principal, quitar el flag de las demás
    if (isPrimary) {
      await this.prisma.client.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    await this.prisma.client.productImage.create({
      data: { productId, imageId, orderIndex, isPrimary },
    });

    return this.findOne(product.id);
  }

  async removeImage(productId: number, imageId: number) {
    await this.findOne(productId);

    const relation = await this.prisma.client.productImage.findUnique({
      where: {
        productId_imageId: { productId, imageId },
      },
    });

    if (!relation) {
      throw new NotFoundException('El producto no tiene esta imagen asignada');
    }

    await this.prisma.client.productImage.delete({
      where: { id: relation.id },
    });

    return this.findOne(productId);
  }

  async setPrimaryImage(productId: number, imageId: number) {
    await this.findOne(productId);

    const relation = await this.prisma.client.productImage.findUnique({
      where: {
        productId_imageId: { productId, imageId },
      },
    });

    if (!relation) {
      throw new NotFoundException('El producto no tiene esta imagen asignada');
    }

    // Quitar el flag de todas las imágenes del producto
    await this.prisma.client.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Establecer la nueva imagen principal
    await this.prisma.client.productImage.update({
      where: { id: relation.id },
      data: { isPrimary: true },
    });

    return this.findOne(productId);
  }

  async addRelatedProduct(productId: number, relatedProductId: number) {
    if (productId === relatedProductId) {
      throw new BadRequestException('Un producto no puede estar relacionado consigo mismo');
    }

    await this.findOne(productId);

    const relatedProduct = await this.prisma.client.product.findUnique({
      where: { id: relatedProductId },
    });

    if (!relatedProduct) {
      throw new NotFoundException('El producto relacionado no existe');
    }

    // Verificar si ya existe la relación
    const existing = await this.prisma.client.productRelated.findUnique({
      where: {
        productId_relatedProductId: { productId, relatedProductId },
      },
    });

    if (existing) {
      throw new BadRequestException('El producto ya está relacionado');
    }

    await this.prisma.client.productRelated.create({
      data: { productId, relatedProductId },
    });

    return this.findOne(productId);
  }

  async removeRelatedProduct(productId: number, relatedProductId: number) {
    await this.findOne(productId);

    const relation = await this.prisma.client.productRelated.findUnique({
      where: {
        productId_relatedProductId: { productId, relatedProductId },
      },
    });

    if (!relation) {
      throw new NotFoundException('El producto no está relacionado');
    }

    await this.prisma.client.productRelated.delete({
      where: { id: relation.id },
    });

    return this.findOne(productId);
  }

  // --- Variantes ---

  private withVariantTotals<T extends { variants?: { stock: number; retailPrice: number; wholesalePrice: number }[] }>(product: T): T & { totalStock: number; minRetailPrice?: number; maxRetailPrice?: number; minWholesalePrice?: number; maxWholesalePrice?: number } {
    const variants = product.variants ?? [];
    const totalStock = variants.reduce((s, v) => s + v.stock, 0);
    const retailPrices = variants.map((v) => v.retailPrice).filter((p) => p != null);
    const wholesalePrices = variants.map((v) => v.wholesalePrice).filter((p) => p != null);
    return {
      ...product,
      totalStock,
      minRetailPrice: retailPrices.length ? Math.min(...retailPrices) : undefined,
      maxRetailPrice: retailPrices.length ? Math.max(...retailPrices) : undefined,
      minWholesalePrice: wholesalePrices.length ? Math.min(...wholesalePrices) : undefined,
      maxWholesalePrice: wholesalePrices.length ? Math.max(...wholesalePrices) : undefined,
    };
  }

  async getVariants(productId: number) {
    await this.findOne(productId);
    return this.prisma.client.productVariant.findMany({
      where: { productId },
      include: {
        values: {
          include: {
            variationTypeValue: {
              include: { variationType: true },
            },
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    });
  }

  async createVariant(productId: number, dto: { sku: string; stock: number; retailPrice: number; wholesalePrice: number; isDefault?: boolean; variationTypeValueIds?: number[] }) {
    const product = await this.prisma.client.product.findUnique({
      where: { id: productId },
      include: { variationTypes: true, variants: true },
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    const existingSku = await this.prisma.client.productVariant.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new BadRequestException('Ya existe una variante con este SKU');
    }
    if (dto.variationTypeValueIds?.length) {
      const typeIds = product.variationTypes.map((pt) => pt.variationTypeId);
      const values = await this.prisma.client.variationTypeValue.findMany({
        where: { id: { in: dto.variationTypeValueIds } },
      });
      for (const v of values) {
        if (!typeIds.includes(v.variationTypeId)) {
          throw new BadRequestException(`El valor ${v.value} no pertenece a un tipo de variación de este producto`);
        }
      }
      if (values.length !== dto.variationTypeValueIds.length) {
        throw new BadRequestException('Uno o más IDs de valor de variación no existen');
      }
    }
    const variant = await this.prisma.client.productVariant.create({
      data: {
        productId,
        sku: dto.sku,
        stock: dto.stock,
        retailPrice: dto.retailPrice,
        wholesalePrice: dto.wholesalePrice,
        isDefault: dto.isDefault ?? false,
      },
    });
    if (dto.isDefault && product.variants.length > 0) {
      await this.prisma.client.productVariant.updateMany({
        where: { productId },
        data: { isDefault: false },
      });
      await this.prisma.client.productVariant.update({
        where: { id: variant.id },
        data: { isDefault: true },
      });
    }
    if (dto.variationTypeValueIds?.length) {
      await this.prisma.client.productVariantValue.createMany({
        data: dto.variationTypeValueIds.map((variationTypeValueId) => ({
          variantId: variant.id,
          variationTypeValueId,
        })),
      });
    }
    return this.prisma.client.productVariant.findUnique({
      where: { id: variant.id },
      include: {
        values: {
          include: {
            variationTypeValue: {
              include: { variationType: true },
            },
          },
        },
      },
    });
  }

  async updateVariant(productId: number, variantId: number, dto: { sku?: string; stock?: number; retailPrice?: number; wholesalePrice?: number; isDefault?: boolean; variationTypeValueIds?: number[] }) {
    const variant = await this.prisma.client.productVariant.findFirst({
      where: { id: variantId, productId },
      include: { product: { include: { variationTypes: true, variants: true } } },
    });
    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }
    if (dto.sku !== undefined) {
      const existing = await this.prisma.client.productVariant.findFirst({
        where: { sku: dto.sku, id: { not: variantId } },
      });
      if (existing) {
        throw new BadRequestException('Ya existe otra variante con este SKU');
      }
    }
    if (dto.isDefault === true) {
      await this.prisma.client.productVariant.updateMany({
        where: { productId },
        data: { isDefault: false },
      });
    }
    if (dto.variationTypeValueIds !== undefined) {
      await this.prisma.client.productVariantValue.deleteMany({
        where: { variantId },
      });
      if (dto.variationTypeValueIds.length > 0) {
        const typeIds = variant.product.variationTypes.map((pt) => pt.variationTypeId);
        const values = await this.prisma.client.variationTypeValue.findMany({
          where: { id: { in: dto.variationTypeValueIds } },
        });
        for (const v of values) {
          if (!typeIds.includes(v.variationTypeId)) {
            throw new BadRequestException(`El valor no pertenece a un tipo de variación de este producto`);
          }
        }
        await this.prisma.client.productVariantValue.createMany({
          data: dto.variationTypeValueIds.map((variationTypeValueId) => ({
            variantId,
            variationTypeValueId,
          })),
        });
      }
    }
    await this.prisma.client.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.retailPrice !== undefined && { retailPrice: dto.retailPrice }),
        ...(dto.wholesalePrice !== undefined && { wholesalePrice: dto.wholesalePrice }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
    return this.prisma.client.productVariant.findUnique({
      where: { id: variantId },
      include: {
        values: {
          include: {
            variationTypeValue: {
              include: { variationType: true },
            },
          },
        },
      },
    });
  }

  async removeVariant(productId: number, variantId: number) {
    const variant = await this.prisma.client.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }
    const count = await this.prisma.client.productVariant.count({
      where: { productId },
    });
    if (count <= 1) {
      throw new BadRequestException('No se puede eliminar la única variante del producto');
    }
    await this.prisma.client.productVariantValue.deleteMany({
      where: { variantId },
    });
    await this.prisma.client.productVariant.delete({
      where: { id: variantId },
    });
    if (variant.isDefault) {
      const next = await this.prisma.client.productVariant.findFirst({
        where: { productId },
      });
      if (next) {
        await this.prisma.client.productVariant.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
    return { deleted: true, id: variantId };
  }
}
