import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsArray, ValidateNested, IsInt, Min, IsOptional, IsBoolean, IsNumberString, ValidateIf, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetProductItemDto {
  /** ID del producto (flujo front). Alternativa: productId para flujo dashboard. */
  @ApiPropertyOptional({ description: 'ID del producto', example: '258' })
  @ValidateIf((o: CreateBudgetProductItemDto) => !o.productId)
  @IsNumberString()
  id?: string;

  /** ID del producto (flujo dashboard). Alternativa: id para flujo front. */
  @ApiPropertyOptional({ description: 'ID del producto (dashboard)', example: '258' })
  @ValidateIf((o: CreateBudgetProductItemDto) => !o.id)
  @IsNumberString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Nombre del producto (informativo)', example: 'XCXXX' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Slug del producto (informativo)', example: 'xcxxx' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen del producto (informativo)' })
  @IsString()
  @IsOptional()
  image?: string;

  /** Cantidad solicitada. Requerida en flujo front; en dashboard se puede derivar de amount/price. */
  @ApiPropertyOptional({ description: 'Cantidad solicitada', example: 7, minimum: 1 })
  @ValidateIf((o: CreateBudgetProductItemDto) => !o.price || !o.amount)
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  /** Precio unitario en centavos (flujo dashboard). */
  @ApiPropertyOptional({ description: 'Precio unitario en centavos', example: 1500 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  /** Monto total del ítem en centavos (flujo dashboard). */
  @ApiPropertyOptional({ description: 'Monto total del ítem en centavos', example: 10500 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  /** Observación del ítem (flujo dashboard). */
  @ApiPropertyOptional({ description: 'Observación del ítem' })
  @IsString()
  @IsOptional()
  observation?: string;
}

export class CreateBudgetDto {
  /** ID del cliente existente (flujo dashboard). Si se envía, name/email/phone/message son opcionales. */
  @ApiPropertyOptional({ description: 'ID del cliente existente (dashboard)' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Nombre del cliente', example: 'Mauricio Jourdan' })
  @ValidateIf((o: CreateBudgetDto) => !o.customerId)
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Email del cliente', example: 'jourdanmauricio@gmail.com' })
  @ValidateIf((o: CreateBudgetDto) => !o.customerId)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del cliente', example: '1158046525' })
  @ValidateIf((o: CreateBudgetDto) => !o.customerId)
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Mensaje u observación del pedido', example: 'asasasas' })
  @IsString()
  @IsOptional()
  message?: string;

  /** Observación del presupuesto (flujo dashboard). Alternativa a message. */
  @ApiPropertyOptional({ description: 'Observación del presupuesto (dashboard)' })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiPropertyOptional({ description: 'ID del responsable', example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  responsibleId?: number;

  @ApiPropertyOptional({ description: 'Fecha de expiración (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Tipo de presupuesto' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Monto total en centavos (dashboard)', example: 10000 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'Estado del presupuesto', example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Indica si se muestra el CUIT en el PDF', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  showCuit?: boolean;

  @ApiProperty({
    description: 'Productos a cotizar',
    type: [CreateBudgetProductItemDto],
    example: [
      { id: '258', name: 'XCXXX', slug: 'xcxxx', image: 'https://...', quantity: 7 },
      { productId: '316', price: 1500, amount: 12000, quantity: 8, observation: 'Notas' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetProductItemDto)
  products: CreateBudgetProductItemDto[];
}
