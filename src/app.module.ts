import { Module } from '@nestjs/common';
import ConfigModule from './config/config.module';
import MongoModule from './databases/mongo.module';
import AggregatorMqController from "./handlers/aggregator.mq.controller";

@Module({
  imports: [
    ConfigModule,
    MongoModule,
  ],
  controllers: [AggregatorMqController],
  providers: [],
})
export class AppModule {
}
