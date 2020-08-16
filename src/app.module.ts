import { Module } from '@nestjs/common';
import ConfigModule from './config/config.module';
import TypeOrmModule from './database/typeorm.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
