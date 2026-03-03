import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SyncVariationTypeValueDto } from './sync-variation-type-value.dto';

export class UpdateVariationTypeDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Nombre del tipo de variación' })
  name?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncVariationTypeValueDto)
  @ApiPropertyOptional({
    description: 'Lista deseada de valores: con id actualiza, sin id crea; los no enviados se eliminan',
    type: [SyncVariationTypeValueDto],
  })
  values?: SyncVariationTypeValueDto[];
}
