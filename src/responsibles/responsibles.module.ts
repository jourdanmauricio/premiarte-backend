import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponsiblesService } from './responsibles.service';
import { ResponsiblesController } from './responsibles.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ResponsiblesController],
  providers: [ResponsiblesService],
  exports: [ResponsiblesService],
})
export class ResponsiblesModule {}
