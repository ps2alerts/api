import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import {Injectable} from '@nestjs/common';
import {resolve} from 'path';

@Injectable()
export class MongoConfig implements TypeOrmOptionsFactory {
    private readonly config: ConfigService;

    constructor(config: ConfigService) {
        this.config = config;
    }

    public createTypeOrmOptions(): TypeOrmModuleOptions {
        const path = resolve(`${__dirname}/../../../dist`);
        return {
            ...this.config.get('database.mongo'),
            entities: [`${path}/**/*.entity.js`],
        };
    }
}
