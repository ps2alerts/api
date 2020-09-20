import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MongoConfig implements TypeOrmOptionsFactory {
  constructor(private config: ConfigService) {}

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.config.get('database.mongo'),
      entities: [
        __dirname + '/../../dist/reports/aggregate/global/*.entity.js',
        __dirname + '/../../dist/reports/aggregate/instance/*.entity.js',
        __dirname + '/../../dist/reports/instance/*.entity.js',
      ],
    };
  }
}
