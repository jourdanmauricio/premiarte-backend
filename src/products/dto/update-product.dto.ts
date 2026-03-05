import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsInt, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateProductPricesDto {
  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({ description: 'IDs de los productos a actualizar' })
  products: number[];

  @IsInt()
  @ApiProperty({ description: 'Porcentaje de ajuste' })
  percentage: number;

  @IsString()
  @ApiProperty({ description: 'Operación a realizar', enum: ['add', 'subtract'] })
  operation: 'add' | 'subtract';
}
