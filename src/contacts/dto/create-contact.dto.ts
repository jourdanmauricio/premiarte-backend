import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ description: 'Nombre del contacto', example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email del contacto', example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Teléfono del contacto', example: '1158046525' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Mensaje del contacto', example: 'Quiero más información sobre sus productos' })
  @IsString()
  message: string;
}
