import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemEntity {
  @ApiProperty({ description: 'ID del ítem' })
  id: number;

  @ApiProperty({ description: 'ID del pedido (UUID)' })
  orderId: string;

  @ApiProperty({ description: 'ID del producto' })
  productId: number;

  @ApiPropertyOptional({ description: 'ID de la variante seleccionada (UUID)', nullable: true })
  variantId?: string | null;

  @ApiProperty({ description: 'Precio unitario en centavos al momento del pedido' })
  price: number;

  @ApiProperty({ description: 'Precio minorista en centavos' })
  retailPrice: number;

  @ApiProperty({ description: 'Precio mayorista en centavos' })
  wholesalePrice: number;

  @ApiProperty({ description: 'Cantidad' })
  quantity: number;

  @ApiProperty({ description: 'Total del ítem (price * quantity) en centavos' })
  amount: number;

  @ApiPropertyOptional({ description: 'Observación del ítem' })
  observation?: string | null;

  @ApiPropertyOptional({ description: 'Atributos de la variante (ej. ["Medida", "Color"])', nullable: true })
  attributes?: string[] | null;

  @ApiPropertyOptional({ description: 'Valores de la variante (ej. ["20 cm", "Plata"])', nullable: true })
  values?: string[] | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}
