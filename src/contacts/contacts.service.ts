import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(createContactDto: CreateContactDto) {
    const contact = await this.prisma.client.contact.create({
      data: createContactDto,
    });
    try {
      await this.mail.sendContactNotification({
        name: createContactDto.name,
        email: createContactDto.email,
        phone: createContactDto.phone,
        message: createContactDto.message,
      });
    } catch (err) {
      console.error('Error al enviar email de contacto:', err);
    }
    return contact;
  }

  async findAll() {
    return this.prisma.client.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const contact = await this.prisma.client.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(`Contacto #${id} no encontrado`);
    }

    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    await this.findOne(id);

    return this.prisma.client.contact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.client.contact.delete({
      where: { id },
    });
    return { message: 'Contacto eliminado correctamente' };
  }
}
