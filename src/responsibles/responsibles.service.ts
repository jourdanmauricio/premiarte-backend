import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResponsibleDto } from './dto/create-responsible.dto';
import { UpdateResponsibleDto } from './dto/update-responsible.dto';

@Injectable()
export class ResponsiblesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResponsibleDto: CreateResponsibleDto) {
    try {
      return await this.prisma.client.responsible.create({
        data: createResponsibleDto,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Ya existe un responsable con ese CUIT');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.client.responsible.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const responsible = await this.prisma.client.responsible.findUnique({
      where: { id },
    });

    if (!responsible) {
      throw new NotFoundException(`Responsable con id ${id} no encontrado`);
    }

    return responsible;
  }

  async update(id: number, updateResponsibleDto: UpdateResponsibleDto) {
    await this.findOne(id);

    try {
      return await this.prisma.client.responsible.update({
        where: { id },
        data: updateResponsibleDto,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Ya existe un responsable con ese CUIT');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.client.responsible.delete({
      where: { id },
    });
    return { message: 'Responsable eliminado correctamente' };
  }
}
