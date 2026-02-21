import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { UpdateBudgetStatusDto } from './dto/update-budget-status.dto';
import { BudgetEntity } from './entities/budget.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Budget')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un presupuesto (cotización desde el front)' })
  @ApiResponse({ status: 201, description: 'Presupuesto creado', type: BudgetEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos o productos no encontrados' })
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Listar todos los presupuestos' })
  @ApiResponse({ status: 200, description: 'Lista de presupuestos', type: [BudgetEntity] })
  findAll() {
    return this.budgetsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener un presupuesto por ID' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Presupuesto encontrado', type: BudgetEntity })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar un presupuesto' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Presupuesto actualizado', type: BudgetEntity })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Put(':id/status')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Modificar solo el estado del presupuesto' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Estado actualizado', type: BudgetEntity })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBudgetStatusDto) {
    return this.budgetsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar un presupuesto' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Presupuesto eliminado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }
}
