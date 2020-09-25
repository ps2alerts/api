import {Module} from '@nestjs/common';
import {DataModule} from '../data/data.module';
import AggregatorInstanceDeathEventController from './controllers/events/aggregator.instance.death.event.controller';
import AggregatorInstanceMetagameEventController from './controllers/events/aggregator.instance.metagame.event.controller';
import AggregatorInstanceFacilityControlEventController
    from './controllers/events/aggregator.instance.facility.control.event.controller';
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
        AggregatorInstanceMetagameEventController,
        AggregatorGlobalCharacterAggregateController,
    ],
    providers: [],
})
export class AggregatorModule {}
