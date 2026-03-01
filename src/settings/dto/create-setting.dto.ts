import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The key of the setting' })
  key: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The value of the setting' })
  value: string;
}
