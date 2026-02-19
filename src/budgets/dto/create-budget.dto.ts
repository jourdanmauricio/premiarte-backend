import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsArray, ValidateNested, IsInt, Min, IsOptional, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetProductItemDto {
  @ApiProperty({ description: 'ID del producto', example: 258 })
  @IsNumberString()
  id: string;

  @ApiPropertyOptional({ description: 'Nombre del producto (informativo)', example: 'XCXXX' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Slug del producto (informativo)', example: 'xcxxx' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen del producto (informativo)' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Cantidad solicitada', example: 7, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateBudgetDto {
  @ApiProperty({ description: 'Nombre del cliente', example: 'Mauricio Jourdan' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email del cliente', example: 'jourdanmauricio@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Teléfono del cliente', example: '1158046525' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Mensaje u observación del pedido', example: 'asasasas' })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Productos a cotizar',
    type: [CreateBudgetProductItemDto],
    example: [
      { id: '258', name: 'XCXXX', slug: 'xcxxx', image: 'https://...', quantity: 7 },
      { id: '316', name: 'Prueba', slug: 'prueba', image: 'https://...', quantity: 8 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetProductItemDto)
  products: CreateBudgetProductItemDto[];
}
