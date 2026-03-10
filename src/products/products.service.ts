import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductPricesDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

interface VariantItem {
  id?: string;
  sku?: string;
  stock?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  isDefault?: boolean;
  attributes?: string[];
  values?: string[];
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseVariants(raw: unknown): VariantItem[] {
    if (!raw || !Array.isArray(raw)) return [];
    return raw as VariantItem[];
  }

  private withVariantTotals<T extends { variants?: unknown; stock: number; retailPrice: number; wholesalePrice: number }>(
    product: T,
  ): T & {
    totalStock: number;
    minRetailPrice: number;
    maxRetailPrice: number;
    minWholesalePrice: number;
    maxWholesalePrice: number;
  } {
    const variants = this.parseVariants(product.variants);

    if (variants.length === 0) {
      return {
        ...product,
        totalStock: product.stock,
        minRetailPrice: product.retailPrice,
        maxRetailPrice: product.retailPrice,
        minWholesalePrice: product.wholesalePrice,
        maxWholesalePrice: product.wholesalePrice,
      };
    }

    const totalStock = variants.reduce((s, v) => s + (v.stock ?? 0), 0);
    const retailPrices = variants.map((v) => v.retailPrice).filter((p): p is number => p != null);
    const wholesalePrices = variants.map((v) => v.wholesalePrice).filter((p): p is number => p != null);

    return {
      ...product,
      totalStock,
      minRetailPrice: retailPrices.length ? Math.min(...retailPrices) : product.retailPrice,
      maxRetailPrice: retailPrices.length ? Math.max(...retailPrices) : product.retailPrice,
      minWholesalePrice: wholesalePrices.length ? Math.min(...wholesalePrices) : product.wholesalePrice,
      maxWholesalePrice: wholesalePrices.length ? Math.max(...wholesalePrices) : product.wholesalePrice,
    };
  }

  async create(createProductDto: CreateProductDto) {
    const { categoryIds, images, relatedProductIds, variants, ...productData } = createProductDto;

    const existingProduct = await this.prisma.client.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existingProduct) {
      throw new BadRequestException('Ya existe un producto con este slug');
    }

    if (productData.sku) {
      const existingSku = await this.prisma.client.product.findUnique({
        where: { sku: productData.sku },
      });

      if (existingSku) {
        throw new BadRequestException('Ya existe un producto con este SKU');
      }
    }

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.prisma.client.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('Una o más categorías no existen');
      }
    }

    if (images && images.length > 0) {
      const existingImages = await this.prisma.client.image.findMany({
        where: { id: { in: images } },
      });

      if (existingImages.length !== images.length) {
        throw new BadRequestException('Una o más imágenes no existen');
      }
    }

    if (relatedProductIds && relatedProductIds.length > 0) {
      const relatedProducts = await this.prisma.client.product.findMany({
        where: { id: { in: relatedProductIds } },
      });

      if (relatedProducts.length !== relatedProductIds.length) {
        throw new BadRequestException('Uno o más productos relacionados no existen');
      }
    }

    const product = await this.prisma.client.product.create({
      data: {
        ...productData,
        variants: variants ? (variants as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
        categories: categoryIds && categoryIds.length > 0 ? { create: categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
        images: images && images.length > 0 ? { create: images.map((imageId, index) => ({ imageId, orderIndex: index, isPrimary: index === 0 })) } : undefined,
        relatedFrom: relatedProductIds && relatedProductIds.length > 0 ? { create: relatedProductIds.map((relatedProductId) => ({ relatedProductId })) } : undefined,
      },
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
      isCustomizable: true,
      retailPrice: true,
      wholesalePrice: true,
      slug: true,
      sku: true,
      priceUpdatedAt: true,
      priceUpdated: true,
      variants: true,
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
      return { data, total, page: 1, limit: total, totalPages: 1 };
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
            category: { include: { image: true } },
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
            category: { include: { image: true } },
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
    await this.findOne(id);

    const { categoryIds, images, relatedProductIds, variants, ...productData } = updateProductDto;

    if (productData.slug) {
      const existingProduct = await this.prisma.client.product.findFirst({
        where: { slug: productData.slug, id: { not: id } },
      });

      if (existingProduct) {
        throw new BadRequestException('Ya existe un producto con este slug');
      }
    }

    if (productData.sku) {
      const existingSku = await this.prisma.client.product.findFirst({
        where: { sku: productData.sku, id: { not: id } },
      });

      if (existingSku) {
        throw new BadRequestException('Ya existe un producto con este SKU');
      }
    }

    if (categoryIds !== undefined && categoryIds.length > 0) {
      const categories = await this.prisma.client.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('Una o más categorías no existen');
      }
    }

    if (images !== undefined && images.length > 0) {
      const existingImages = await this.prisma.client.image.findMany({
        where: { id: { in: images } },
      });

      if (existingImages.length !== images.length) {
        throw new BadRequestException('Una o más imágenes no existen');
      }
    }

    if (relatedProductIds !== undefined && relatedProductIds.length > 0) {
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

    return this.prisma.client
      .$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            ...productData,
            variants: variants !== undefined ? (variants as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
            priceUpdatedAt: productData.retailPrice !== undefined || productData.wholesalePrice !== undefined ? new Date() : undefined,
          },
        });

        if (categoryIds !== undefined) {
          await tx.productCategory.deleteMany({ where: { productId: id } });
          if (categoryIds.length > 0) {
            await tx.productCategory.createMany({
              data: categoryIds.map((categoryId) => ({ productId: id, categoryId })),
            });
          }
        }

        if (images !== undefined) {
          await tx.productImage.deleteMany({ where: { productId: id } });
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

        if (relatedProductIds !== undefined) {
          await tx.productRelated.deleteMany({ where: { productId: id } });
          if (relatedProductIds.length > 0) {
            await tx.productRelated.createMany({
              data: relatedProductIds.map((relatedProductId) => ({ productId: id, relatedProductId })),
            });
          }
        }

        const updated = await tx.product.findUnique({
          where: { id },
          include: {
            categories: { include: { category: true } },
            images: { include: { image: true }, orderBy: { orderIndex: 'asc' } },
            relatedFrom: { include: { relatedProduct: true } },
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
    return this.prisma.client.product.delete({ where: { id } });
  }

  // Gestión de categorías

  async addCategory(productId: number, categoryId: number) {
    const product = await this.findOne(productId);

    const category = await this.prisma.client.category.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const existing = await this.prisma.client.productCategory.findUnique({
      where: { productId_categoryId: { productId, categoryId } },
    });

    if (existing) {
      throw new BadRequestException('El producto ya tiene esta categoría asignada');
    }

    await this.prisma.client.productCategory.create({ data: { productId, categoryId } });

    return this.findOne(product.id);
  }

  async removeCategory(productId: number, categoryId: number) {
    await this.findOne(productId);

    const relation = await this.prisma.client.productCategory.findUnique({
      where: { productId_categoryId: { productId, categoryId } },
    });

    if (!relation) {
      throw new NotFoundException('El producto no tiene esta categoría asignada');
    }

    await this.prisma.client.productCategory.delete({ where: { id: relation.id } });

    return this.findOne(productId);
  }

  // Gestión de imágenes

  async addImage(productId: number, imageId: number, orderIndex = 0, isPrimary = false) {
    const product = await this.findOne(productId);

    const image = await this.prisma.client.image.findUnique({ where: { id: imageId } });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    const existing = await this.prisma.client.productImage.findUnique({
      where: { productId_imageId: { productId, imageId } },
    });

    if (existing) {
      throw new BadRequestException('El producto ya tiene esta imagen asignada');
    }

    if (isPrimary) {
      await this.prisma.client.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    await this.prisma.client.productImage.create({ data: { productId, imageId, orderIndex, isPrimary } });

    return this.findOne(product.id);
  }

  async removeImage(productId: number, imageId: number) {
    await this.findOne(productId);

    const relation = await this.prisma.client.productImage.findUnique({
      where: { productId_imageId: { productId, imageId } },
    });

    if (!relation) {
      throw new NotFoundException('El producto no tiene esta imagen asignada');
    }

    await this.prisma.client.productImage.delete({ where: { id: relation.id } });

    return this.findOne(productId);
  }

  async setPrimaryImage(productId: number, imageId: number) {
    await this.findOne(productId);

    const relation = await this.prisma.client.productImage.findUnique({
      where: { productId_imageId: { productId, imageId } },
    });

    if (!relation) {
      throw new NotFoundException('El producto no tiene esta imagen asignada');
    }

    await this.prisma.client.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });

    await this.prisma.client.productImage.update({
      where: { id: relation.id },
      data: { isPrimary: true },
    });

    return this.findOne(productId);
  }

  // Gestión de productos relacionados

  async addRelatedProduct(productId: number, relatedProductId: number) {
    if (productId === relatedProductId) {
      throw new BadRequestException('Un producto no puede estar relacionado consigo mismo');
    }

    await this.findOne(productId);

    const relatedProduct = await this.prisma.client.product.findUnique({ where: { id: relatedProductId } });

    if (!relatedProduct) {
      throw new NotFoundException('El producto relacionado no existe');
    }

    const existing = await this.prisma.client.productRelated.findUnique({
      where: { productId_relatedProductId: { productId, relatedProductId } },
    });

    if (existing) {
      throw new BadRequestException('El producto ya está relacionado');
    }

    await this.prisma.client.productRelated.create({ data: { productId, relatedProductId } });

    return this.findOne(productId);
  }

  async removeRelatedProduct(productId: number, relatedProductId: number) {
    await this.findOne(productId);

    const relation = await this.prisma.client.productRelated.findUnique({
      where: { productId_relatedProductId: { productId, relatedProductId } },
    });

    if (!relation) {
      throw new NotFoundException('El producto no está relacionado');
    }

    await this.prisma.client.productRelated.delete({ where: { id: relation.id } });

    return this.findOne(productId);
  }
}
