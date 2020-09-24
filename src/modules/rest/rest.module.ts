import {Module} from '@nestjs/common';
import {RestInstanceController} from './controllers/rest.instance.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import InstanceMetagameEntity from '../data/entities/instance/instance.metagame.entity';

/**
 * Handles incoming requests to the API via HTTP, CRUD environment.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            InstanceMetagameEntity,
        ]),
    ],
    controllers: [
        RestInstanceController,
    ],
    providers: [],
})
export class RestModule {}
