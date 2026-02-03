import { ApiProperty } from '@nestjs/swagger';

export type { User } from '@prisma/client';

export class UserPublicEntity {
  @ApiProperty({ description: 'ID único del usuario', example: 'clx1234567890' })
  id: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'juan@ejemplo.com' })
  email: string;

  @ApiProperty({ description: 'Fecha de creación del usuario' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del usuario' })
  updatedAt: Date;
}
