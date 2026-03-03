import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVariationTypeDto } from './dto/create-variation-type.dto';
import { UpdateVariationTypeDto } from './dto/update-variation-type.dto';
import { CreateVariationTypeValueDto } from './dto/create-variation-type-value.dto';
import { UpdateVariationTypeValueDto } from './dto/update-variation-type-value.dto';

@Injectable()
export class VariationTypesService {
  constructor(private readonly prisma: PrismaService) {}

  // --- VariationType CRUD ---

  async createType(dto: CreateVariationTypeDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const type = await tx.variationType.create({
        data: { name: dto.name },
      });
      if (dto.values?.length) {
        await tx.variationTypeValue.createMany({
          data: dto.values.map((v) => ({ variationTypeId: type.id, value: v.value })),
        });
      }
      return tx.variationType.findUniqueOrThrow({
        where: { id: type.id },
        include: { values: { orderBy: { value: 'asc' } } },
      });
    });
  }

  async findAllTypes() {
    return this.prisma.client.variationType.findMany({
      orderBy: { name: 'asc' },
      include: { values: { orderBy: { value: 'asc' } } },
    });
  }

  async findOneType(id: number) {
    const type = await this.prisma.client.variationType.findUnique({
      where: { id },
      include: { values: { orderBy: { value: 'asc' } } },
    });
    if (!type) {
      throw new NotFoundException('Tipo de variación no encontrado');
    }
    return type;
  }

  async updateType(id: number, dto: UpdateVariationTypeDto) {
    await this.findOneType(id);
    return this.prisma.client.$transaction(async (tx) => {
      if (dto.name !== undefined) {
        await tx.variationType.update({
          where: { id },
          data: { name: dto.name },
        });
      }
      if (dto.values !== undefined) {
        const current = await tx.variationTypeValue.findMany({
          where: { variationTypeId: id },
          select: { id: true },
        });
        const currentIds = new Set(current.map((v) => v.id));
        const incomingIds = new Set(
          dto.values.map((v) => v.id).filter((n): n is number => n != null),
        );
        const toDelete = current.filter((v) => !incomingIds.has(v.id));
        const toCreate = dto.values.filter((v) => v.id == null);
        const toUpdate = dto.values.filter((v) => v.id != null && currentIds.has(v.id));
        for (const v of toDelete) {
          await tx.variationTypeValue.delete({ where: { id: v.id } });
        }
        if (toCreate.length) {
          await tx.variationTypeValue.createMany({
            data: toCreate.map((v) => ({ variationTypeId: id, value: v.value })),
          });
        }
        for (const v of toUpdate) {
          if (v.id == null) continue;
          await tx.variationTypeValue.update({
            where: { id: v.id },
            data: { value: v.value },
          });
        }
      }
      return tx.variationType.findUniqueOrThrow({
        where: { id },
        include: { values: { orderBy: { value: 'asc' } } },
      });
    });
  }

  async removeType(id: number) {
    await this.findOneType(id);
    return this.prisma.client.variationType.delete({
      where: { id },
    });
  }

  // --- VariationTypeValue CRUD (por tipo) ---

  async createValue(variationTypeId: number, dto: CreateVariationTypeValueDto) {
    await this.findOneType(variationTypeId);
    return this.prisma.client.variationTypeValue.create({
      data: {
        variationTypeId,
        value: dto.value,
      },
      include: { variationType: true },
    });
  }

  async findAllValues(variationTypeId: number) {
    await this.findOneType(variationTypeId);
    return this.prisma.client.variationTypeValue.findMany({
      where: { variationTypeId },
      orderBy: { value: 'asc' },
      include: { variationType: { select: { id: true, name: true } } },
    });
  }

  async findOneValue(variationTypeId: number, valueId: number) {
    const value = await this.prisma.client.variationTypeValue.findFirst({
      where: { id: valueId, variationTypeId },
      include: { variationType: true },
    });
    if (!value) {
      throw new NotFoundException('Valor de variación no encontrado');
    }
    return value;
  }

  async updateValue(variationTypeId: number, valueId: number, dto: UpdateVariationTypeValueDto) {
    await this.findOneValue(variationTypeId, valueId);
    return this.prisma.client.variationTypeValue.update({
      where: { id: valueId },
      data: {
        ...(dto.value !== undefined && { value: dto.value }),
      },
      include: { variationType: true },
    });
  }

  async removeValue(variationTypeId: number, valueId: number) {
    await this.findOneValue(variationTypeId, valueId);
    return this.prisma.client.variationTypeValue.delete({
      where: { id: valueId },
    });
  }
}
