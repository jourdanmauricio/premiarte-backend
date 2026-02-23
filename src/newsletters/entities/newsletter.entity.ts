import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NewsletterSubscriberEntity {
  @ApiProperty({ description: 'ID del suscriptor', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del suscriptor', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ description: 'Email del suscriptor', example: 'juan@example.com' })
  email: string;

  @ApiProperty({ description: 'Indica si la suscripción está activa', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de suscripción' })
  subscribedAt: Date;

  @ApiPropertyOptional({ description: 'Fecha de desuscripción' })
  unsubscribedAt?: Date | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}
