import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImageEntity } from 'src/images/entities/image.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';

export type { Product } from '@prisma/client';

export class ProductImageEntity {
  @ApiProperty({ description: 'ID único de la relación producto-imagen' })
  id: number;

  @ApiProperty({ description: 'ID del producto' })
  productId: number;

  @ApiProperty({ description: 'ID de la imagen' })
  imageId: number;

  @ApiProperty({ description: 'Índice de orden de la imagen' })
  orderIndex: number;

  @ApiProperty({ description: 'Indica si es la imagen principal' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Imagen asociada', type: ImageEntity })
  image: ImageEntity;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;
}

export class ProductCategoryEntity {
  @ApiProperty({ description: 'ID único de la relación producto-categoría' })
  id: number;

  @ApiProperty({ description: 'ID del producto' })
  productId: number;

  @ApiProperty({ description: 'ID de la categoría' })
  categoryId: number;

  @ApiProperty({ description: 'Categoría asociada', type: CategoryEntity })
  category: CategoryEntity;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;
}

export class ProductRelatedEntity {
  @ApiProperty({ description: 'ID único de la relación' })
  id: number;

  @ApiProperty({ description: 'ID del producto origen' })
  productId: number;

  @ApiProperty({ description: 'ID del producto relacionado' })
  relatedProductId: number;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;
}

export class ProductEntity {
  @ApiProperty({ description: 'ID único del producto' })
  id: number;

  @ApiProperty({ description: 'Nombre del producto' })
  name: string;

  @ApiProperty({ description: 'Descripción del producto' })
  description: string;

  @ApiProperty({ description: 'Cantidad en stock' })
  stock: number;

  @ApiProperty({ description: 'Indica si el producto está activo' })
  isActive: boolean;

  @ApiProperty({ description: 'Indica si el producto es destacado' })
  isFeatured: boolean;

  @ApiProperty({ description: 'Precio minorista en centavos' })
  retailPrice: number;

  @ApiProperty({ description: 'Precio mayorista en centavos' })
  wholesalePrice: number;

  @ApiProperty({ description: 'Slug del producto para URLs amigables' })
  slug: string;

  @ApiPropertyOptional({ description: 'ID de la categoría principal (legacy)' })
  categoryId?: number;

  @ApiPropertyOptional({ description: 'SKU del producto' })
  sku?: string;

  @ApiPropertyOptional({ description: 'Fecha de última actualización de precio' })
  priceUpdatedAt?: Date;

  @ApiPropertyOptional({ description: 'Información de actualización de precio' })
  priceUpdated?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Imágenes del producto',
    type: [ProductImageEntity],
  })
  images?: ProductImageEntity[];

  @ApiPropertyOptional({
    description: 'Categorías del producto',
    type: [ProductCategoryEntity],
  })
  categories?: ProductCategoryEntity[];

  @ApiPropertyOptional({
    description: 'Productos relacionados',
    type: [ProductRelatedEntity],
  })
  relatedFrom?: ProductRelatedEntity[];
}
