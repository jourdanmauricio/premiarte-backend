import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, IsArray, Min } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  @ApiProperty({ description: 'SKU único de la variante' })
  sku: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Stock' })
  stock: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Precio minorista en centavos' })
  retailPrice: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Precio mayorista en centavos' })
  wholesalePrice: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Si es la variante por defecto', default: false })
  isDefault?: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'IDs de VariationTypeValue que definen esta combinación (ej. color=rojo, talle=M)',
    type: [Number],
  })
  variationTypeValueIds?: number[];
}
