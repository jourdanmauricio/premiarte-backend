import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez', required: false })
  name?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'juan@ejemplo.com', required: false })
  email?: string;
}
