import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

/** Item para conciliar valores en PUT: con id actualiza, sin id crea. Los que no vengan se eliminan. */
export class SyncVariationTypeValueDto {
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ description: 'ID del valor existente (omitir para crear uno nuevo)' })
  id?: number;

  @IsString()
  @ApiProperty({ description: 'Texto del valor (ej: Rojo, S, M)' })
  value: string;
}
