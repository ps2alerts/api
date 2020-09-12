import { Module } from '@nestjs/common';
import ConfigModule from './config/config.module';
import MongoModule from './databases/mongo.module';

@Module({
  imports: [
    ConfigModule,
    MongoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
