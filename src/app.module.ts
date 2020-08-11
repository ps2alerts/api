import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import ConfigModule from './modules/ConfigModule';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule,
    MongooseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
