import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponsibleEntity {
  @ApiProperty({ description: 'ID del responsable' })
  id: number;

  @ApiProperty({ description: 'Nombre del responsable' })
  name: string;

  @ApiProperty({ description: 'CUIT (único)' })
  cuit: string;

  @ApiProperty({ description: 'Condición (ej. monotributista, responsable inscripto)' })
  condition: string;

  @ApiPropertyOptional({ description: 'Observación' })
  observation?: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}
