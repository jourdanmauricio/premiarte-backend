import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactEntity {
  @ApiProperty({ description: 'ID del contacto', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del contacto', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ description: 'Email del contacto', example: 'juan@example.com' })
  email: string;

  @ApiPropertyOptional({ description: 'Teléfono del contacto', example: '1158046525' })
  phone?: string | null;

  @ApiProperty({ description: 'Mensaje del contacto' })
  message: string;

  @ApiProperty({ description: 'Indica si fue leído', default: false })
  isRead: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}
