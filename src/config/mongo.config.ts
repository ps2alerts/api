import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import {Injectable} from '@nestjs/common';

@Injectable()
export class MongoConfig implements TypeOrmOptionsFactory {
    private readonly config: ConfigService;

    constructor(config: ConfigService) {
        this.config = config;
    }

    public createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            ...this.config.get('database.mongo'),
            entities: [
                `${__dirname}/../../dist/reports/aggregate/global/*.entity.js`,
                // For some reason the database initialization breaks when we reference /reports/aggregate via a wildcard...
                `${__dirname}/../../dist/reports/aggregate/instance/character.entity.js`,
                `${__dirname}/../../dist/reports/aggregate/instance/class.entity.js`,
                `${__dirname}/../../dist/reports/aggregate/instance/facilitycontrol.entity.js`,
                `${__dirname}/../../dist/reports/aggregate/instance/factioncombat.entity.js`,
                `${__dirname}/../../dist/reports/aggregate/instance/outfit.entity.js`,
                `${__dirname}/../../dist/reports/aggregate/instance/population.entity.js`,
                `${__dirname}/../../dist/reports/aggregate/instance/weapon.entity.js`,
                `${__dirname}/../../dist/reports/instance/*.entity.js`,
            ],
        };
    }
}
