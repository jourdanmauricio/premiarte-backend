import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsInt, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

// products: number[];
// percentage: number;
// operation: "add" | "subtract";

export class UpdateProductPricesDto {
  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({ description: 'ID del producto' })
  products: number[];

  @IsInt()
  @ApiProperty({ description: 'Precio minorista en centavos' })
  percentage: number;

  @IsString()
  @ApiProperty({ description: 'Operación a realizar' })
  operation: 'add' | 'subtract';
}
