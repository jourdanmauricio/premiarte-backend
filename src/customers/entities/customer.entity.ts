import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerEntity {
  @ApiProperty({ description: 'ID del cliente (UUID)' })
  id: string;

  @ApiProperty({ description: 'Nombre del cliente' })
  name: string;

  @ApiProperty({ description: 'Email del cliente (único)' })
  email: string;

  @ApiProperty({ description: 'Teléfono del cliente' })
  phone: string;

  @ApiProperty({ description: 'Tipo de cliente', enum: ['retail', 'wholesale'] })
  type: string;

  @ApiPropertyOptional({ description: 'Documento (ej. DNI, CUIT)' })
  document?: string | null;

  @ApiPropertyOptional({ description: 'Dirección' })
  address?: string | null;

  @ApiPropertyOptional({ description: 'Observación' })
  observation?: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}
