import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @ValidateIf((object: ResetPasswordDto, value: string) => value === object.confirmPassword, { message: 'Las contraseñas no coinciden' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty()
  @ApiProperty({ description: 'Contraseña del usuario', example: 'miPassword123' })
  password: string;

  @IsString()
  @ValidateIf((object: ResetPasswordDto, value: string) => value === object.password, { message: 'Las contraseñas no coinciden' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty()
  @ApiProperty({ description: 'Confirmación de la contraseña', example: 'miPassword123' })
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Token de recuperación de contraseña', example: 'token123' })
  token: string;
}
