import {Module} from '@nestjs/common';
import ConfigModule from './config/config.module';
import {DefaultController} from './controllers/default.controller';
import {RestModule} from './modules/rest/rest.module';
import {AggregatorModule} from './modules/aggregator/aggregator.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MongoConfig} from './services/databases/mongo.config';
import {ScheduleModule} from '@nestjs/schedule';
import {CronModule} from './modules/cron/CronModule';
import {HealthCheckModule} from './modules/healthcheck/HealthCheckModule';
import {PrometheusModule} from '@willsoto/nestjs-prometheus';

const metadata = {
    imports: [
        ConfigModule, // Must come first
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: MongoConfig,
        }),
        HealthCheckModule,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        PrometheusModule.register(),
    ],
    controllers: [DefaultController],
    providers: [],
};

if (process.env.AGGREGATOR_ENABLED === 'true') {
    metadata.imports.push(AggregatorModule);
}

if (process.env.CRON_ENABLED === 'true') {
    metadata.imports.push(ScheduleModule.forRoot(), CronModule);
}

if (process.env.REST_ENABLED === 'true') {
    metadata.imports.push(RestModule);
}

@Module(metadata)
export class AppModule {}
