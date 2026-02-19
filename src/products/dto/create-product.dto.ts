import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, IsArray, Min, IsDate } from 'class-validator';

/**
 * DTO para agregar una imagen individual a un producto (usado en endpoint POST /products/:id/images)
 */
export class ProductImageDto {
  @IsInt()
  @ApiProperty({ description: 'ID de la imagen' })
  imageId: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @ApiPropertyOptional({ description: 'Índice de orden de la imagen', default: 0 })
  orderIndex?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Indica si es la imagen principal', default: false })
  isPrimary?: boolean;
}

export class CreateProductDto {
  @IsString()
  @ApiProperty({ description: 'Nombre del producto' })
  name: string;

  @IsString()
  @ApiProperty({ description: 'Descripción del producto' })
  description: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Cantidad en stock' })
  stock: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Indica si el producto está activo', default: true })
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Indica si el producto es destacado', default: false })
  isFeatured?: boolean;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Precio minorista en centavos' })
  retailPrice: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Precio mayorista en centavos' })
  wholesalePrice: number;

  @IsString()
  @ApiProperty({ description: 'Slug del producto para URLs amigables' })
  slug: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'SKU del producto' })
  sku?: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ description: 'ID de la categoría principal (legacy)' })
  categoryId?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'IDs de las categorías a asociar',
    type: [Number],
  })
  categoryIds?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'IDs de las imágenes a asociar (la primera será la imagen principal)',
    type: [Number],
  })
  images?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'IDs de productos relacionados',
    type: [Number],
  })
  relatedProductIds?: number[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Información de actualización de precio' })
  priceUpdated?: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Fecha de actualización de precio' })
  priceUpdatedAt?: Date;
}
