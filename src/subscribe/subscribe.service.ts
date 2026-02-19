import { Injectable } from '@nestjs/common';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscribeService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSubscribeDto: CreateSubscribeDto) {
    // Verificar si el correo electrónico ya existe
    const existingSubscriber = await this.prisma.client.newsletterSubscriber.findUnique({
      where: { email: createSubscribeDto.email },
    });
    if (existingSubscriber) {
      // activate the subscriber
      await this.prisma.client.newsletterSubscriber.update({
        where: { id: existingSubscriber.id },
        data: { isActive: true, name: createSubscribeDto.name },
      });
      return {
        message: 'El correo electrónico ya está registrado',
        status: 'success',
        data: existingSubscriber,
      };
    }

    return this.prisma.client.newsletterSubscriber.create({
      data: createSubscribeDto,
    });
  }

  findAll() {
    return `This action returns all subscribe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscribe`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscribe`;
  }
}
