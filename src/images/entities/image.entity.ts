import { ApiProperty } from '@nestjs/swagger';

export type { Image } from '@prisma/client';

export class ImageEntity {
  @ApiProperty({ description: 'ID de la imagen' })
  id: number;

  @ApiProperty({ description: 'URL de la imagen' })
  url: string;

  @ApiProperty({ description: 'Texto alternativo de la imagen' })
  alt: string;

  @ApiProperty({ description: 'Etiqueta de la imagen', required: false })
  tag?: string;

  @ApiProperty({ description: 'Observación', required: false })
  observation?: string;

  @ApiProperty({ description: 'Public ID (Cloudinary)', required: false })
  publicId?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
