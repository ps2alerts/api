import {Module} from '@nestjs/common';
import {DataModule} from '../data/data.module';
import InstanceDeathController from './controllers/instancedeath.controller';
import InstanceMetagameController from './controllers/instancemetagame.controller';

/**
 * This module processes the incoming messages from the PS2Alerts Aggregator component.
 */
@Module({
    imports: [
        DataModule,
    ],
    controllers: [
        InstanceDeathController,
        InstanceMetagameController,
    ],
    providers: [],
})
export class AggregatorModule {}
