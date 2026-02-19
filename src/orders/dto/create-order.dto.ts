import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsInt, Min, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID del producto', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  productId: number;

  @ApiProperty({ description: 'Cantidad', example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: 'Precio unitario en centavos al momento del pedido' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Precio minorista en centavos' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  retailPrice: number;

  @ApiProperty({ description: 'Precio mayorista en centavos' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  wholesalePrice: number;

  @ApiProperty({ description: 'Total del ítem (price * quantity) en centavos' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ description: 'Observación del ítem' })
  @IsString()
  @IsOptional()
  observation?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID del cliente (UUID)' })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Tipo de pedido',
    enum: ['retail', 'wholesale'],
    example: 'retail',
  })
  @IsString()
  @IsIn(['retail', 'wholesale'])
  type: string;

  @ApiPropertyOptional({
    description: 'Estado del pedido',
    example: 'pending',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Monto total del pedido en centavos (enviado por el front)' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Observación del pedido' })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiProperty({
    description: 'Ítems del pedido',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  products: CreateOrderItemDto[];
}
