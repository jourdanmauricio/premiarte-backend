import { Module } from '@nestjs/common';
import { UsersController } from 'src/users/controllers/users.controller';
import { UsersService } from 'src/users/services/users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
