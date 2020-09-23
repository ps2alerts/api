import {Module} from '@nestjs/common';
import MongoModule from '../../services/databases/mongo.module';
import {InstancesController} from './controllers/instances.controller';

/**
 * Handles incoming requests to the API via HTTP, CRUD environment.
 */
@Module({
    imports: [
        MongoModule,
    ],
    controllers: [
        InstancesController,
    ],
    providers: [],
})
export class RestModule {}
