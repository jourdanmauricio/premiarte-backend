import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Texto alternativo de la imagen', required: false, example: 'Descripción de la imagen' })
  alt?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Etiqueta de la imagen', required: false, example: 'producto' })
  tag?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Observación sobre la imagen', required: false, example: 'Imagen principal' })
  observation?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Public ID personalizado para Cloudinary', required: false, example: 'premiarte/mi-imagen' })
  public_id?: string;
}
