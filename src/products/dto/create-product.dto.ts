import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsOptional, IsArray, Min, IsDate, ValidateNested } from 'class-validator';

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

export class ProductVariantDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'ID de la variante (UUID, ej. para identificar en el cliente)' })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'SKU único de la variante' })
  sku?: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Stock de la variante' })
  stock: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Precio minorista de la variante en centavos' })
  retailPrice: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Precio mayorista de la variante en centavos' })
  wholesalePrice: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Si es la variante por defecto', default: false })
  isDefault?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'Nombres de los atributos (ej. ["Medida", "Color"])',
    example: ['Medida', 'Color'],
  })
  attributes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'Valores de los atributos en el mismo orden que attributes (ej. ["20 cm", "Rojo"])',
    example: ['20 cm', 'Rojo'],
  })
  values?: string[];
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @ApiPropertyOptional({
    description: 'Variantes del producto. Si se omite o es [], el producto usa sus propios campos de stock y precio.',
    type: [ProductVariantDto],
  })
  variants?: ProductVariantDto[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Información de actualización de precio' })
  priceUpdated?: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Fecha de actualización de precio' })
  priceUpdatedAt?: Date;
}
