import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controller/users.controller';
import { UserEntity } from './model/user.entity';
import { UsersService } from './service/user-service/users.service';
import { UsersHelperService } from './service/users-helper/users-helper.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService, UsersHelperService],
})
export class UsersModule {}
