import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetItemEntity } from './budget-item.entity';

export class BudgetEntity {
  @ApiProperty({ description: 'ID del presupuesto (UUID)' })
  id: string;

  @ApiProperty({ description: 'ID del cliente (UUID)' })
  customerId: string;

  @ApiProperty({ description: 'Indica si se muestra el CUIT en el PDF', default: false })
  showCuit: boolean;

  @ApiPropertyOptional({ description: 'Observación' })
  observation?: string | null;

  @ApiProperty({ description: 'Monto total en centavos', default: 0 })
  totalAmount: number;

  @ApiProperty({ description: 'Estado', default: 'pending' })
  status: string;

  @ApiPropertyOptional({ description: 'ID del usuario asignado' })
  userId?: string | null;

  @ApiProperty({ description: 'Indica si fue leído', default: false })
  isRead: boolean;

  @ApiPropertyOptional({ description: 'Fecha de expiración' })
  expiresAt?: Date | null;

  @ApiPropertyOptional({ description: 'Fecha de aprobación' })
  approvedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Fecha de rechazo' })
  rejectedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Tipo de presupuesto' })
  type?: string | null;

  @ApiPropertyOptional({ description: 'ID del responsable' })
  responsibleId?: number | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Ítems del presupuesto', type: [BudgetItemEntity] })
  items?: BudgetItemEntity[];
}
