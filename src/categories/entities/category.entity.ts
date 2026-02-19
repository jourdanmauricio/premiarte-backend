import { ApiProperty } from '@nestjs/swagger';
import { ImageEntity } from 'src/images/entities/image.entity';

export type { Category } from '@prisma/client';

export class CategoryEntity {
  @ApiProperty({ description: 'ID único de la categoría' })
  id: number;

  @ApiProperty({ description: 'Nombre de la categoría' })
  name: string;

  @ApiProperty({ description: 'Slug de la categoría para URLs amigables' })
  slug: string;

  @ApiProperty({ description: 'Descripción de la categoría' })
  description: string;

  @ApiProperty({ description: 'ID de la imagen asociada' })
  imageId: number;

  @ApiProperty({ description: 'Imagen asociada', type: ImageEntity })
  image: ImageEntity;

  @ApiProperty({ description: 'Indica si la categoría es destacada' })
  featured: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
