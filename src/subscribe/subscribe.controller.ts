import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) {}

  @Post()
  create(@Body() createSubscribeDto: CreateSubscribeDto) {
    return this.subscribeService.create(createSubscribeDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.subscribeService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.subscribeService.findOne(+id);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.subscribeService.remove(+id);
  }
}
