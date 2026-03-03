import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { VariationTypesService } from './variation-types.service';
import { CreateVariationTypeDto } from './dto/create-variation-type.dto';
import { UpdateVariationTypeDto } from './dto/update-variation-type.dto';
import { CreateVariationTypeValueDto } from './dto/create-variation-type-value.dto';
import { UpdateVariationTypeValueDto } from './dto/update-variation-type-value.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Variation Types')
@Controller('variation-types')
export class VariationTypesController {
  constructor(private readonly variationTypesService: VariationTypesService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Crear un tipo de variación y opcionalmente sus valores' })
  @ApiResponse({ status: 201, description: 'Tipo creado (con valores si se enviaron)' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  createType(@Body() dto: CreateVariationTypeDto) {
    return this.variationTypesService.createType(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de variación' })
  @ApiResponse({ status: 200, description: 'Lista de tipos con sus valores' })
  findAllTypes() {
    return this.variationTypesService.findAllTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de variación por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo', type: Number })
  @ApiResponse({ status: 200, description: 'Tipo con valores' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOneType(@Param('id', ParseIntPipe) id: number) {
    return this.variationTypesService.findOneType(id);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar nombre y/o conciliar valores del tipo' })
  @ApiParam({ name: 'id', description: 'ID del tipo', type: Number })
  @ApiResponse({ status: 200, description: 'Tipo actualizado (nombre y/o valores conciliados)' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  updateType(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVariationTypeDto) {
    return this.variationTypesService.updateType(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar un tipo de variación' })
  @ApiParam({ name: 'id', description: 'ID del tipo', type: Number })
  @ApiResponse({ status: 200, description: 'Tipo eliminado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  removeType(@Param('id', ParseIntPipe) id: number) {
    return this.variationTypesService.removeType(id);
  }

  // --- Valores del tipo (sub-recurso) ---

  @Get(':id/values')
  @ApiOperation({ summary: 'Listar valores de un tipo de variación' })
  @ApiParam({ name: 'id', description: 'ID del tipo', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de valores' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  findAllValues(@Param('id', ParseIntPipe) id: number) {
    return this.variationTypesService.findAllValues(id);
  }

  @Post(':id/values')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Crear un valor para el tipo' })
  @ApiParam({ name: 'id', description: 'ID del tipo', type: Number })
  @ApiResponse({ status: 201, description: 'Valor creado' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  createValue(@Param('id', ParseIntPipe) variationTypeId: number, @Body() dto: CreateVariationTypeValueDto) {
    return this.variationTypesService.createValue(variationTypeId, dto);
  }

  @Get(':id/values/:valueId')
  @ApiOperation({ summary: 'Obtener un valor por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo', type: Number })
  @ApiParam({ name: 'valueId', description: 'ID del valor', type: Number })
  @ApiResponse({ status: 200, description: 'Valor' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOneValue(@Param('id', ParseIntPipe) variationTypeId: number, @Param('valueId', ParseIntPipe) valueId: number) {
    return this.variationTypesService.findOneValue(variationTypeId, valueId);
  }

  @Put(':id/values/:valueId')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar un valor' })
  @ApiParam({ name: 'id', description: 'ID del tipo', type: Number })
  @ApiParam({ name: 'valueId', description: 'ID del valor', type: Number })
  @ApiResponse({ status: 200, description: 'Valor actualizado' })
  updateValue(@Param('id', ParseIntPipe) variationTypeId: number, @Param('valueId', ParseIntPipe) valueId: number, @Body() dto: UpdateVariationTypeValueDto) {
    return this.variationTypesService.updateValue(variationTypeId, valueId, dto);
  }

  @Delete(':id/values/:valueId')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar un valor' })
  @ApiParam({ name: 'id', description: 'ID del tipo', type: Number })
  @ApiParam({ name: 'valueId', description: 'ID del valor', type: Number })
  @ApiResponse({ status: 200, description: 'Valor eliminado' })
  removeValue(@Param('id', ParseIntPipe) variationTypeId: number, @Param('valueId', ParseIntPipe) valueId: number) {
    return this.variationTypesService.removeValue(variationTypeId, valueId);
  }
}
