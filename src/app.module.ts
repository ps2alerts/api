import {Module} from '@nestjs/common';
import ConfigModule from './config/config.module';
import MongoModule from './databases/mongo.module';
import InstanceDeathController from './controllers/instancedeath.controller';
import InstanceMetagameController from './controllers/instancemetagame.controller';

@Module({
    imports: [
        ConfigModule,
        MongoModule,
    ],
    controllers: [
        InstanceDeathController,
        InstanceMetagameController,
    ],
    providers: [],
})
export class AppModule {}
