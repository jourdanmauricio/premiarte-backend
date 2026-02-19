/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async create(file: Express.Multer.File, createImageDto?: CreateImageDto) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Subir a Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        folder: 'premiarte',
      };

      if (createImageDto?.public_id) {
        uploadOptions.public_id = createImageDto.public_id;
      }

      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(new Error(error.message));
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('No se recibió respuesta de Cloudinary'));
        }
      });

      uploadStream.end(file.buffer);
    });

    // Crear registro en la base de datos
    const image = await this.prisma.client.image.create({
      data: {
        url: uploadResult.secure_url,
        alt: createImageDto?.alt ?? file.originalname,
        tag: createImageDto?.tag,
        observation: createImageDto?.observation,
        publicId: uploadResult.public_id,
      },
    });

    return image;
  }

  private async deleteFromCloudinary(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error al eliminar imagen de Cloudinary:', error);
    }
  }

  findAll() {
    return this.prisma.client.image.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        alt: true,
        tag: true,
        publicId: true,
      },
    });
  }

  async findOne(id: number) {
    const image = await this.prisma.client.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    return image;
  }

  async update(id: number, updateImageDto: UpdateImageDto) {
    await this.findOne(id);

    return this.prisma.client.image.update({
      where: { id },
      data: updateImageDto,
    });
  }

  async remove(id: number) {
    const image = await this.findOne(id);

    // Eliminar de Cloudinary si tiene publicId
    if (image.publicId) {
      await this.deleteFromCloudinary(image.publicId);
    }

    return this.prisma.client.image.delete({
      where: { id },
    });
  }
}
