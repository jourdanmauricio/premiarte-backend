import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'juan@ejemplo.com' })
  email: string;
}
