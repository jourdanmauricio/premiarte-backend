import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVariationTypeValueDto } from './create-variation-type-value.dto';

export class CreateVariationTypeDto {
  @IsString()
  @ApiProperty({ description: 'Nombre del tipo de variación (ej: Color, Talle)' })
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariationTypeValueDto)
  @ApiPropertyOptional({
    description: 'Valores/opciones del tipo (opcional)',
    type: [CreateVariationTypeValueDto],
  })
  values?: CreateVariationTypeValueDto[];
}
