import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { RequestLoggerMiddleware } from './common/request-logger.middleware.js';
import { AuthController } from './auth/auth.controller.js';
import { UsersController } from './users/users.controller.js';

@Module({
  imports: [AuthModule, UsersModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes(AuthController, UsersController);
  }
}
