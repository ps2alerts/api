import {Module} from '@nestjs/common';
import {DataModule} from '../data/data.module';
import AggregatorInstanceDeathController from './controllers/aggregator.instance.death.controller';
import AggregatorInstanceMetagameController from './controllers/aggregator.instance.metagame.controller';

/**
 * This module processes the incoming messages from the PS2Alerts Aggregator component.
 */
@Module({
    imports: [
        DataModule,
    ],
    controllers: [
        AggregatorInstanceDeathController,
        AggregatorInstanceMetagameController,
    ],
    providers: [],
})
export class AggregatorModule {}
