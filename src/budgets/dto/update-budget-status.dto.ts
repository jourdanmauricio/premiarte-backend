import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateBudgetStatusDto {
  @ApiProperty({ description: 'Estado del presupuesto', example: 'pending' })
  @IsString()
  status: string;
}
