import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateResponsibleDto {
  @IsString()
  @MinLength(1, { message: 'El nombre es requerido' })
  @ApiProperty({ description: 'Nombre del responsable' })
  name: string;

  @IsString()
  @MinLength(1, { message: 'El CUIT es requerido' })
  @ApiProperty({ description: 'CUIT (único)', example: '20-12345678-9' })
  cuit: string;

  @IsString()
  @MinLength(1, { message: 'La condición es requerida' })
  @ApiProperty({ description: 'Condición (ej. monotributista, responsable inscripto)' })
  condition: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Observación' })
  observation?: string | null;
}
