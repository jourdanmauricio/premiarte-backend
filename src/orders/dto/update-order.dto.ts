import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsArray, IsDateString, IsInt, IsNumberString, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderProductItemDto {
  @ApiPropertyOptional({ description: 'ID del producto', example: 258 })
  @IsNumberString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'Cantidad solicitada', example: 7, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Cantidad solicitada', example: 7, minimum: 1 })
  @ApiPropertyOptional({ description: 'Precio unitario en centavos al momento de la cotización' })
  @IsInt()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Precio minorista en centavos al momento de la cotización' })
  @IsInt()
  @IsOptional()
  retailPrice?: number;

  @ApiPropertyOptional({ description: 'Precio mayorista en centavos al momento de la cotización' })
  @IsInt()
  @IsOptional()
  wholesalePrice?: number;

  @ApiPropertyOptional({ description: 'Observación del ítem' })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiPropertyOptional({ description: 'Precio unitario en centavos al momento de la cotización' })
  @IsInt()
  @IsOptional()
  price?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'Observación del pedido' })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiPropertyOptional({ description: 'Estado del pedido', example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Fecha de aprobación (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  approvedAt?: string;

  @ApiPropertyOptional({ description: 'Fecha de rechazo (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  rejectedAt?: string;

  @ApiPropertyOptional({ description: 'ID del usuario asignado' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'ID del responsable' })
  @IsInt()
  @IsOptional()
  responsibleId?: number;

  @ApiPropertyOptional({ description: 'Tipo de pedido' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'ID del cliente' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Productos a actualizar',
    type: [UpdateOrderProductItemDto],
    example: [
      { productId: '258', quantity: 7 },
      { productId: '316', quantity: 8 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderProductItemDto)
  products: UpdateOrderProductItemDto[];

  @ApiPropertyOptional({ description: 'Monto total en centavos (se recalcula si se envían items)' })
  @Allow()
  @IsOptional()
  @IsInt()
  @Min(0)
  totalAmount?: number;
}
