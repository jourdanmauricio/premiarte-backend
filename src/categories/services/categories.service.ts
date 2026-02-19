import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Verificar que la imagen existe
    const image = await this.prisma.client.image.findUnique({
      where: { id: createCategoryDto.imageId },
    });

    if (!image) {
      throw new BadRequestException('La imagen especificada no existe');
    }

    const existingCategory = await this.prisma.client.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new BadRequestException('Ya existe una categoría con este slug');
    }

    return this.prisma.client.category.create({
      data: createCategoryDto,
      include: { image: true },
    });
  }

  findAll(options?: { isFeatured?: boolean }) {
    return this.prisma.client.category.findMany({
      where: {
        ...(options?.isFeatured !== undefined && { featured: options.isFeatured }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageId: true,
        featured: true,
        image: {
          select: {
            id: true,
            url: true,
            alt: true,
            tag: true,
            publicId: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.client.category.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Verificar que la categoría existe
    await this.findOne(id);

    // Si se actualiza imageId, verificar que existe
    if (updateCategoryDto.imageId) {
      const image = await this.prisma.client.image.findUnique({
        where: { id: updateCategoryDto.imageId },
      });

      if (!image) {
        throw new BadRequestException('La imagen especificada no existe');
      }
    }

    return this.prisma.client.category.update({
      where: { id },
      data: updateCategoryDto,
      include: { image: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.category.delete({
      where: { id },
    });
  }
}
