import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BudgetItemEntity {
  @ApiProperty({ description: 'ID del ítem' })
  id: number;

  @ApiProperty({ description: 'ID del presupuesto (UUID)' })
  budgetId: string;

  @ApiProperty({ description: 'ID del producto' })
  productId: number;

  @ApiProperty({ description: 'Precio unitario en centavos al momento de la cotización' })
  price: number;

  @ApiProperty({ description: 'Cantidad' })
  quantity: number;

  @ApiProperty({ description: 'Total del ítem (price * quantity) en centavos' })
  amount: number;

  @ApiProperty({ description: 'Precio minorista en centavos' })
  retailPrice: number;

  @ApiProperty({ description: 'Precio mayorista en centavos' })
  wholesalePrice: number;

  @ApiPropertyOptional({ description: 'Observación del ítem' })
  observation?: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}
