import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemEntity } from './order-item.entity.js';

export class OrderEntity {
  @ApiProperty({ description: 'ID del pedido (UUID)' })
  id: string;

  @ApiProperty({ description: 'ID del cliente (UUID)' })
  customerId: string;

  @ApiProperty({ description: 'Tipo de pedido (retail | wholesale)' })
  type: string;

  @ApiProperty({ description: 'Estado del pedido' })
  status: string;

  @ApiProperty({ description: 'Monto total en centavos' })
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Observación' })
  observation?: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Ítems del pedido', type: [OrderItemEntity] })
  items?: OrderItemEntity[];
}
