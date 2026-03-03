import { Module } from '@nestjs/common';
import { VariationTypesService } from './variation-types.service';
import { VariationTypesController } from './variation-types.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VariationTypesController],
  providers: [VariationTypesService],
  exports: [VariationTypesService],
})
export class VariationTypesModule {}
