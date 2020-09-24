import {Module} from '@nestjs/common';
import {DataModule} from '../data/data.module';
import AggregatorInstanceDeathEventController from './controllers/instance/aggregator.instance.death.event.controller';
import AggregatorInstanceMetagameController from './controllers/instance/aggregator.instance.metagame.controller';
import AggregatorInstanceFacilityControlEventController
    from './controllers/instance/aggregator.instance.facility.control.event.controller';
import AggregatorGlobalCharacterAggregateController
    from './controllers/aggregates/global/aggregator.global.character.aggregate.controller';

/**
 * This module processes the incoming messages from the PS2Alerts Aggregator component.
 */
@Module({
    imports: [
        DataModule,
    ],
    controllers: [
        AggregatorInstanceDeathEventController,
        AggregatorInstanceFacilityControlEventController,
        AggregatorInstanceMetagameController,
        AggregatorGlobalCharacterAggregateController,
    ],
    providers: [],
})
export class AggregatorModule {}
