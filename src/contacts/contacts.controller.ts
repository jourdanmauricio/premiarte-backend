import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactEntity } from './entities/contact.entity';

@ApiTags('Contact')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un mensaje de contacto (formulario público)' })
  @ApiResponse({ status: 201, description: 'Contacto creado', type: ContactEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Listar todos los mensajes de contacto' })
  @ApiResponse({ status: 200, description: 'Lista de contactos', type: [ContactEntity] })
  findAll() {
    return this.contactsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener un mensaje de contacto por ID' })
  @ApiParam({ name: 'id', description: 'ID del contacto', type: Number })
  @ApiResponse({ status: 200, description: 'Contacto encontrado', type: ContactEntity })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar un mensaje de contacto' })
  @ApiParam({ name: 'id', description: 'ID del contacto', type: Number })
  @ApiResponse({ status: 200, description: 'Contacto actualizado', type: ContactEntity })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar un mensaje de contacto' })
  @ApiParam({ name: 'id', description: 'ID del contacto', type: Number })
  @ApiResponse({ status: 200, description: 'Contacto eliminado' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.remove(id);
  }
}
