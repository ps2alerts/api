import {Module} from '@nestjs/common';
import ConfigModule from './config/config.module';
import {DefaultController} from './controllers/default.controller';
import {RestModule} from './modules/rest/rest.module';
import {AggregatorModule} from './modules/aggregator/aggregator.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MongoConfig} from './services/databases/mongo.config';

@Module({
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
})
export class AppModule {}
