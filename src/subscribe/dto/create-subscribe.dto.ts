import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateSubscribeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre del suscriptor' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Correo electrónico del suscriptor' })
  email: string;
}
