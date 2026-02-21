import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductImageDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductPricesDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente', type: ProductEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrar por estado activo' })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean, description: 'Filtrar por productos destacados' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filtrar por categoría' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Filtrar por página' })
  @ApiResponse({ status: 200, description: 'Lista de productos', type: [ProductEntity] })
  findAll(@Query('isActive') isActive?: string, @Query('isFeatured') isFeatured?: string, @Query('category') category?: string, @Query('page') page?: string) {
    return this.productsService.findAll({
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      category: category !== undefined ? category : undefined,
      page: page !== undefined ? page : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiResponse({ status: 200, description: 'Producto encontrado', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener un producto por slug' })
  @ApiParam({ name: 'slug', description: 'Slug del producto', type: String })
  @ApiResponse({ status: 200, description: 'Producto encontrado', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Put('update-prices')
  @ApiOperation({ summary: 'Actualizar los precios de un producto' })
  @ApiBody({ type: UpdateProductPricesDto })
  @ApiResponse({ status: 200, description: 'Imágenes actualizadas exitosamente', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  updateProductImages(@Body() updateProductPricesDto: UpdateProductPricesDto) {
    return this.productsService.updateProductPrices(updateProductPricesDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  // Endpoints para gestión de categorías del producto

  @Post(':id/categories/:categoryId')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Agregar una categoría a un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiParam({ name: 'categoryId', description: 'ID de la categoría', type: Number })
  @ApiResponse({ status: 200, description: 'Categoría agregada exitosamente', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto o categoría no encontrada' })
  @ApiResponse({ status: 400, description: 'La categoría ya está asignada' })
  addCategory(@Param('id', ParseIntPipe) id: number, @Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productsService.addCategory(id, categoryId);
  }

  @Delete(':id/categories/:categoryId')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar una categoría de un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiParam({ name: 'categoryId', description: 'ID de la categoría', type: Number })
  @ApiResponse({ status: 200, description: 'Categoría eliminada exitosamente', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto o relación no encontrada' })
  removeCategory(@Param('id', ParseIntPipe) id: number, @Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productsService.removeCategory(id, categoryId);
  }

  // Endpoints para gestión de imágenes del producto

  @Post(':id/images')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Agregar una imagen a un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiBody({ type: ProductImageDto })
  @ApiResponse({ status: 200, description: 'Imagen agregada exitosamente', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto o imagen no encontrada' })
  @ApiResponse({ status: 400, description: 'La imagen ya está asignada' })
  addImage(@Param('id', ParseIntPipe) id: number, @Body() imageDto: ProductImageDto) {
    return this.productsService.addImage(id, imageDto.imageId, imageDto.orderIndex, imageDto.isPrimary);
  }

  @Delete(':id/images/:imageId')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar una imagen de un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiParam({ name: 'imageId', description: 'ID de la imagen', type: Number })
  @ApiResponse({ status: 200, description: 'Imagen eliminada exitosamente', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto o relación no encontrada' })
  removeImage(@Param('id', ParseIntPipe) id: number, @Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.removeImage(id, imageId);
  }

  @Put(':id/images/:imageId/primary')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Establecer una imagen como principal' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiParam({ name: 'imageId', description: 'ID de la imagen', type: Number })
  @ApiResponse({ status: 200, description: 'Imagen establecida como principal', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto o relación no encontrada' })
  setPrimaryImage(@Param('id', ParseIntPipe) id: number, @Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.setPrimaryImage(id, imageId);
  }

  // Endpoints para gestión de productos relacionados

  @Post(':id/related/:relatedId')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Agregar un producto relacionado' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiParam({ name: 'relatedId', description: 'ID del producto relacionado', type: Number })
  @ApiResponse({ status: 200, description: 'Producto relacionado agregado', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 400, description: 'La relación ya existe o es inválida' })
  addRelatedProduct(@Param('id', ParseIntPipe) id: number, @Param('relatedId', ParseIntPipe) relatedId: number) {
    return this.productsService.addRelatedProduct(id, relatedId);
  }

  @Delete(':id/related/:relatedId')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar un producto relacionado' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiParam({ name: 'relatedId', description: 'ID del producto relacionado', type: Number })
  @ApiResponse({ status: 200, description: 'Producto relacionado eliminado', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  removeRelatedProduct(@Param('id', ParseIntPipe) id: number, @Param('relatedId', ParseIntPipe) relatedId: number) {
    return this.productsService.removeRelatedProduct(id, relatedId);
  }
}
