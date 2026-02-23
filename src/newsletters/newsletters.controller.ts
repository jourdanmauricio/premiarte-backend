import { Controller, Get, Post, Body, Param, Delete, Put, Patch, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NewslettersService } from './newsletters.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { NewsletterSubscriberEntity } from './entities/newsletter.entity';

@ApiTags('Newsletter')
@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Post()
  @ApiOperation({ summary: 'Suscribirse al newsletter (formulario público)' })
  @ApiResponse({ status: 201, description: 'Suscripción creada', type: NewsletterSubscriberEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya suscrito' })
  create(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newslettersService.create(createNewsletterDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Listar todos los suscriptores del newsletter' })
  @ApiResponse({ status: 200, description: 'Lista de suscriptores', type: [NewsletterSubscriberEntity] })
  findAll() {
    return this.newslettersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener un suscriptor por ID' })
  @ApiParam({ name: 'id', description: 'ID del suscriptor', type: Number })
  @ApiResponse({ status: 200, description: 'Suscriptor encontrado', type: NewsletterSubscriberEntity })
  @ApiResponse({ status: 404, description: 'Suscriptor no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newslettersService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar un suscriptor' })
  @ApiParam({ name: 'id', description: 'ID del suscriptor', type: Number })
  @ApiResponse({ status: 200, description: 'Suscriptor actualizado', type: NewsletterSubscriberEntity })
  @ApiResponse({ status: 404, description: 'Suscriptor no encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsletterDto: UpdateNewsletterDto) {
    return this.newslettersService.update(id, updateNewsletterDto);
  }

  @Patch(':id/unsubscribe')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Desuscribir a un suscriptor' })
  @ApiParam({ name: 'id', description: 'ID del suscriptor', type: Number })
  @ApiResponse({ status: 200, description: 'Suscriptor desuscrito', type: NewsletterSubscriberEntity })
  @ApiResponse({ status: 404, description: 'Suscriptor no encontrado' })
  unsubscribe(@Param('id', ParseIntPipe) id: number) {
    return this.newslettersService.unsubscribe(id);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar un suscriptor' })
  @ApiParam({ name: 'id', description: 'ID del suscriptor', type: Number })
  @ApiResponse({ status: 200, description: 'Suscriptor eliminado' })
  @ApiResponse({ status: 404, description: 'Suscriptor no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newslettersService.remove(id);
  }
}
