import { ApiProperty } from '@nestjs/swagger';
import { UserPublicEntity } from 'src/users/entities/users.entity';

export class LoginResponseEntity {
  @ApiProperty({ description: 'Datos del usuario autenticado', type: UserPublicEntity })
  user: UserPublicEntity;

  @ApiProperty({ description: 'Token JWT de acceso', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}
