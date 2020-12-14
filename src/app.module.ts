import {Module} from '@nestjs/common';
import ConfigModule from './config/config.module';
import {DefaultController} from './controllers/default.controller';
import {RestModule} from './modules/rest/rest.module';
import {AggregatorModule} from './modules/aggregator/aggregator.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MongoConfig} from './services/databases/mongo.config';
import {ScheduleModule} from '@nestjs/schedule';
import {CronModule} from './modules/cron/CronModule';

const metadata = {
    imports: [
        ConfigModule, // Must come first
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: MongoConfig,
        }),
        AggregatorModule,
        RestModule,
    ],
    controllers: [DefaultController],
    providers: [],
};

if (process.env.CRON_ENABLED === 'true') {
    metadata.imports.push(ScheduleModule.forRoot(), CronModule);
}

@Module(metadata)
export class AppModule {}
