import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Contraseña actual del usuario', example: 'miPasswordActual' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @ApiProperty({ description: 'Nueva contraseña del usuario (mínimo 8 caracteres)', example: 'miNuevoPassword123' })
  newPassword: string;
}
