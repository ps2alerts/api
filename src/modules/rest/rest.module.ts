import {Module} from '@nestjs/common';
import MongoModule from '../../services/databases/mongo.module';
import InstanceDeathController from '../aggregator/controllers/instancedeath.controller';
import InstanceMetagameController from '../aggregator/controllers/instancemetagame.controller';

/**
 * Handles incoming requests to the API via HTTP, CRUD environment.
 */
@Module({
    imports: [
        MongoModule,
    ],
    controllers: [
        InstanceDeathController,
        InstanceMetagameController,
    ],
    providers: [],
})
export class RestModule {}
