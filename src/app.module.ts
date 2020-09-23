import {Module} from '@nestjs/common';
import ConfigModule from './config/config.module';
import {DefaultController} from './controllers/default.controller';
import {RestModule} from './modules/rest/rest.module';
import {AggregatorModule} from './modules/aggregator/aggregator.module';

@Module({
    imports: [
        ConfigModule, // Must come first
        AggregatorModule,
        RestModule,
    ],
    controllers: [DefaultController],
    providers: [],
})
export class AppModule {}
