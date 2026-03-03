import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateVariationTypeValueDto {
  @IsString()
  @ApiProperty({ description: 'Valor del atributo (ej: Rojo, S, M)' })
  value: string;
}
