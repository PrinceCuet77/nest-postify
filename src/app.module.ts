import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { RequestLoggerMiddleware } from './common/request-logger.middleware.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { UsersController } from './modules/users/users.controller.js';
import { AdminController } from './modules/admin/admin.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AdminModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes(AuthController, UsersController, AdminController);
  }
}
