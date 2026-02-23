import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateNewsletterDto {
  @ApiProperty({ description: 'Nombre del suscriptor', example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email del suscriptor', example: 'juan@example.com' })
  @IsEmail()
  email: string;
}
