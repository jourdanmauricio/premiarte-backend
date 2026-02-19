import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, IsIn } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(1, { message: 'El nombre es requerido' })
  @ApiProperty({ description: 'Nombre del cliente', example: 'Juan Pérez' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  @ApiPropertyOptional({ description: 'Email del cliente (único cuando tiene valor)', example: 'juan@ejemplo.com' })
  email?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Si se envía teléfono no puede estar vacío' })
  @ApiPropertyOptional({ description: 'Teléfono del cliente (único cuando tiene valor)', example: '1158046525' })
  phone?: string | null;

  @IsString()
  @IsIn(['retail', 'wholesale'], { message: "El tipo debe ser 'retail' o 'wholesale'" })
  @ApiPropertyOptional({
    description: 'Tipo de cliente',
    enum: ['retail', 'wholesale'],
    default: 'retail',
  })
  type?: 'retail' | 'wholesale';

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Documento (ej. DNI, CUIT)' })
  document?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Dirección' })
  address?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Observación' })
  observation?: string | null;
}
