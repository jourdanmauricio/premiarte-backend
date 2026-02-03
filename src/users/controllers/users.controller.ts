import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { UsersService, UserPublic } from 'src/users/services/users.service';
import { AuthGuard } from '@nestjs/passport';
import { Payload } from 'src/auth/models/payload.model';
import type { Request } from 'express';
import { UserPublicEntity } from '../entities/users.entity';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [UserPublicEntity] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(): Promise<UserPublic[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserPublicEntity })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getUser(@Param('id') id: string): Promise<UserPublic> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserPublicEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o email ya registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  createUser(@Body() body: CreateUserDto, @Req() req: Request) {
    const payload = req.user as Payload;
    const userId = payload.sub;
    console.log('userId', userId);
    return this.usersService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente', type: UserPublicEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Cambiar la contraseña de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta o datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  changePassword(@Param('id') id: string, @Body() body: ChangePasswordDto) {
    return this.usersService.changePassword(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
