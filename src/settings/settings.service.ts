import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createSettingDto: CreateSettingDto) {
    console.log('createSettingDto', createSettingDto);
    return 'This action adds a new setting';
  }

  async findAll() {
    const settings = await this.prisma.client.setting.findMany();
    return settings;
  }

  async findOne(id: number) {
    const setting = await this.prisma.client.setting.findUnique({
      where: { id },
    });
    return setting;
  }

  async findOneByPage(key: string) {
    const setting = await this.prisma.client.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    const value = JSON.parse(setting.value) as Record<string, any>;

    return value;
  }

  // El campo values es un objeto JSON con las propiedades de la página
  // debería buscar el setting por la key y luego buscar el valor de la propiedad featured
  async findOneByFeatured(page: string, featured: string) {
    const setting = await this.prisma.client.setting.findUnique({
      where: {
        key: page,
      },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    const value = JSON.parse(setting.value) as Record<string, any>;
    if (!value[featured]) {
      throw new NotFoundException('Featured not found');
    }

    return value[featured] as string;
  }

  async update(id: number, updateSettingDto: UpdateSettingDto) {
    const setting = await this.findOne(id);
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    let newValue: string;

    // Si la key del DTO coincide con la key del setting → reemplazo completo
    if (updateSettingDto.key === setting.key) {
      newValue = typeof updateSettingDto.value === 'string' ? updateSettingDto.value : JSON.stringify(updateSettingDto.value);
    } else {
      // Actualización parcial: merge en el objeto existente
      const value = JSON.parse(setting.value) as Record<string, any>;
      value[updateSettingDto.key ?? ''] = updateSettingDto.value ?? '';
      newValue = JSON.stringify(value);
    }

    return this.prisma.client.setting.update({
      where: { id },
      data: { value: newValue },
    });
  }
}
