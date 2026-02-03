import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'juan@ejemplo.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @ApiProperty({ description: 'Contraseña del usuario (mínimo 8 caracteres)', example: 'miPassword123' })
  password: string;
}
