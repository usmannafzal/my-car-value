import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UserService } from './user/user.service';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [UsersModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
