import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';

@Injectable()
export class NewslettersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNewsletterDto: CreateNewsletterDto) {
    const existing = await this.prisma.client.newsletterSubscriber.findUnique({
      where: { email: createNewsletterDto.email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Este email ya está suscrito al newsletter');
      }

      return this.prisma.client.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          name: createNewsletterDto.name,
          isActive: true,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      });
    }

    return this.prisma.client.newsletterSubscriber.create({
      data: createNewsletterDto,
    });
  }

  async findAll() {
    return this.prisma.client.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const subscriber = await this.prisma.client.newsletterSubscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      throw new NotFoundException(`Suscriptor #${id} no encontrado`);
    }

    return subscriber;
  }

  async update(id: number, updateNewsletterDto: UpdateNewsletterDto) {
    await this.findOne(id);

    return this.prisma.client.newsletterSubscriber.update({
      where: { id },
      data: updateNewsletterDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.client.newsletterSubscriber.delete({
      where: { id },
    });
    return { message: 'Suscriptor eliminado correctamente' };
  }

  async unsubscribe(id: number) {
    await this.findOne(id);

    return this.prisma.client.newsletterSubscriber.update({
      where: { id },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });
  }
}
