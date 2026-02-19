/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export interface UserWithPassword {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublic = Omit<UserWithPassword, 'password'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Campos a retornar (excluye password)
  private readonly userSelect = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  };

  findAll(): Promise<UserPublic[]> {
    return this.prisma.client.user.findMany({
      select: this.userSelect,
    });
  }

  async findOne(id: string): Promise<UserPublic> {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  findOneByEmail(email: string) {
    const user = this.prisma.client.user.findUnique({
      where: { email },
      select: this.userSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Método interno que sí retorna el password (para autenticación)
  findOneByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  async create(user: CreateUserDto) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: user.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const saltOrRounds = 10;
    const password = user.password;
    const hashPassword = await bcrypt.hash(password, saltOrRounds);

    const newUser = {
      name: user.name,
      email: user.email,
      password: hashPassword,
    };

    return this.prisma.client.user.create({
      data: newUser,
      select: this.userSelect,
    });
  }

  async update(id: string, user: UpdateUserDto) {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.client.user.update({
      where: { id },
      data: user,
      select: this.userSelect,
    });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    // Obtener usuario con password para verificar
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar que la contraseña actual sea correcta
    // const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

    // if (!isPasswordValid) {
    //   throw new BadRequestException('La contraseña actual es incorrecta');
    // }

    // Hashear la nueva contraseña
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, saltOrRounds);

    // Actualizar la contraseña
    await this.prisma.client.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async delete(id: string) {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.client.user.delete({
      where: { id },
    });

    return 'User deleted successfully';
  }
}
