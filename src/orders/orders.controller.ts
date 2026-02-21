import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado', type: OrderEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos o cliente/productos no encontrados' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos', type: [OrderEntity] })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID del pedido (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Pedido encontrado', type: OrderEntity })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un pedido' })
  @ApiParam({ name: 'id', description: 'ID del pedido (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Pedido actualizado', type: OrderEntity })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un pedido' })
  @ApiParam({ name: 'id', description: 'ID del pedido (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Pedido eliminado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
