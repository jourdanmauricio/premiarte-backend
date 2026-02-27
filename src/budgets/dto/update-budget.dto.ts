import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsOptional, IsInt, IsDateString, IsArray, ValidateNested, IsNumberString, Min } from 'class-validator';

export class UpdateBudgetProductItemDto {
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

  @ApiPropertyOptional({ description: 'Precio unitario en centavos al momento de la cotización' })
  @IsInt()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Observación del ítem' })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiPropertyOptional({ description: 'Precio unitario en centavos al momento de la cotización' })
  @IsInt()
  @IsOptional()
  price?: number;
}

export class UpdateBudgetDto {
  @ApiPropertyOptional({ description: 'Observación del presupuesto' })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiPropertyOptional({ description: 'Estado del presupuesto', example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Indica si fue leído' })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de expiración (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

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

  @ApiPropertyOptional({ description: 'Tipo de presupuesto' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'ID del cliente' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Indica si se muestra el CUIT en el PDF' })
  @IsBoolean()
  @IsOptional()
  showCuit?: boolean;

  @ApiPropertyOptional({
    description: 'Productos a cotizar',
    type: [UpdateBudgetProductItemDto],
    example: [
      { id: '258', name: 'XCXXX', slug: 'xcxxx', image: 'https://...', quantity: 7 },
      { id: '316', name: 'Prueba', slug: 'prueba', image: 'https://...', quantity: 8 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBudgetProductItemDto)
  products: UpdateBudgetProductItemDto[];

  @ApiPropertyOptional({ description: 'Monto total en centavos', example: 10000 })
  @IsInt()
  @IsOptional()
  totalAmount?: number;
}
