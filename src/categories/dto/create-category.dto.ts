import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @ApiProperty({ description: 'The name of the category' })
  name: string;

  @IsString()
  @ApiProperty({ description: 'The slug of the category' })
  slug: string;

  @IsString()
  @ApiProperty({ description: 'The description of the category' })
  description: string;

  @IsInt()
  @ApiProperty({ description: 'The image ID of the category' })
  imageId: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: 'Whether the category is featured' })
  featured?: boolean;
}
