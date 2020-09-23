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
        const path = `${__dirname}/../../../dist/modules/data/entities`;
        console.log(path);
        return {
            ...this.config.get('database.mongo'),
            entities: [
                // `${path}/aggregate/global/*.entity.js`,
                // For some reason the database initialization breaks when we reference /reports/aggregate via a wildcard...
                `${path}/aggregate/instance/character.entity.js`,
                `${path}/aggregate/instance/class.entity.js`,
                `${path}/aggregate/instance/facilitycontrol.entity.js`,
                `${path}/aggregate/instance/factioncombat.entity.js`,
                `${path}/aggregate/instance/outfit.entity.js`,
                `${path}/aggregate/instance/population.entity.js`,
                `${path}/aggregate/instance/weapon.entity.js`,
                `${path}/instance/*.entity.js`,
                `${path}/aggregate/common/*.entity.js`,
            ],
        };
    }
}
