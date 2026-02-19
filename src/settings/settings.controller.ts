import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(+id);
  }

  @Get('page/:page/featured/:featured')
  @ApiOperation({ summary: 'Obtener un setting por featured' })
  @ApiParam({ name: 'featured', description: 'Featured del setting', type: String })
  @ApiResponse({ status: 200, description: 'Setting encontrado' }) // , type: SettingEntity })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  findOneByFeatured(@Param('page') page: string, @Param('featured') featured: string) {
    return this.settingsService.findOneByFeatured(page, featured);
  }

  @Get('page/:page')
  @ApiOperation({ summary: 'Obtener un setting por página' })
  @ApiParam({ name: 'page', description: 'Página del setting', type: String })
  @ApiResponse({ status: 200, description: 'Setting encontrado' }) // , type: SettingEntity })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  findOneByPage(@Param('page') page: string) {
    return this.settingsService.findOneByPage(page);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(+id, updateSettingDto);
  }
}
