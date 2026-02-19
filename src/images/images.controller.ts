import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImageEntity } from './entities/image.entity';

@ApiTags('Images')
@ApiBearerAuth('access-token')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir una imagen a Cloudinary y crear registro' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (jpg, jpeg, png, gif, webp)',
        },
        alt: {
          type: 'string',
          description: 'Texto alternativo de la imagen',
        },
        tag: {
          type: 'string',
          description: 'Etiqueta de la imagen',
        },
        observation: {
          type: 'string',
          description: 'Observación sobre la imagen',
        },
        public_id: {
          type: 'string',
          description: 'Public ID personalizado para Cloudinary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Imagen subida exitosamente', type: ImageEntity })
  @ApiResponse({ status: 400, description: 'Archivo inválido o datos incorrectos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imagesService.create(file, createImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las imágenes' })
  @ApiResponse({ status: 200, description: 'Lista de imágenes', type: [ImageEntity] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll() {
    return this.imagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una imagen por ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen', type: Number })
  @ApiResponse({ status: 200, description: 'Imagen encontrada', type: ImageEntity })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una imagen por ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen', type: Number })
  @ApiResponse({ status: 200, description: 'Imagen actualizada exitosamente', type: ImageEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(+id, updateImageDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una imagen por ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen', type: Number })
  @ApiResponse({ status: 200, description: 'Imagen eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  remove(@Param('id') id: string) {
    return this.imagesService.remove(+id);
  }
}
