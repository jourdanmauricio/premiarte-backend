import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ResponsiblesService } from './responsibles.service';
import { CreateResponsibleDto } from './dto/create-responsible.dto';
import { UpdateResponsibleDto } from './dto/update-responsible.dto';
import { ResponsibleEntity } from './entities/responsible.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Responsibles')
@Controller('responsibles')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class ResponsiblesController {
  constructor(private readonly responsiblesService: ResponsiblesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un responsable' })
  @ApiResponse({ status: 201, description: 'Responsable creado', type: ResponsibleEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un responsable con ese CUIT' })
  create(@Body() createResponsibleDto: CreateResponsibleDto) {
    return this.responsiblesService.create(createResponsibleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los responsables' })
  @ApiResponse({ status: 200, description: 'Lista de responsables', type: [ResponsibleEntity] })
  findAll() {
    return this.responsiblesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un responsable por ID' })
  @ApiParam({ name: 'id', description: 'ID del responsable', type: Number })
  @ApiResponse({ status: 200, description: 'Responsable encontrado', type: ResponsibleEntity })
  @ApiResponse({ status: 404, description: 'Responsable no encontrado' })
  findOne(@Param('id') id: string) {
    return this.responsiblesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un responsable' })
  @ApiParam({ name: 'id', description: 'ID del responsable', type: Number })
  @ApiResponse({ status: 200, description: 'Responsable actualizado', type: ResponsibleEntity })
  @ApiResponse({ status: 404, description: 'Responsable no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un responsable con ese CUIT' })
  update(@Param('id') id: string, @Body() updateResponsibleDto: UpdateResponsibleDto) {
    return this.responsiblesService.update(+id, updateResponsibleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un responsable' })
  @ApiParam({ name: 'id', description: 'ID del responsable', type: Number })
  @ApiResponse({ status: 200, description: 'Responsable eliminado' })
  @ApiResponse({ status: 404, description: 'Responsable no encontrado' })
  remove(@Param('id') id: string) {
    return this.responsiblesService.remove(+id);
  }
}
