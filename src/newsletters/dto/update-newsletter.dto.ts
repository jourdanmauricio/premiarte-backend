import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class UpdateNewsletterDto {
  @ApiPropertyOptional({ description: 'Nombre del suscriptor', example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Email del suscriptor', example: 'juan@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Indica si la suscripción está activa' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
