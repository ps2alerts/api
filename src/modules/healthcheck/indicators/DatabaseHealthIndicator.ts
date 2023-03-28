/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable} from '@nestjs/common';
import {HealthCheckError, HealthIndicator, HealthIndicatorResult} from '@nestjs/terminus';
import GlobalCharacterAggregateEntity from '../../data/entities/aggregate/global/global.character.aggregate.entity';
import {Bracket} from '../../data/ps2alerts-constants/bracket';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {
        super();
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        // Check if the DB is alive
        const character: GlobalCharacterAggregateEntity = await this.mongoOperationsService.findOne(
            GlobalCharacterAggregateEntity,
            {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                'character.id': key,
                bracket: Bracket.TOTAL,
            },
        );

        if (!character?.character || character.character.name !== 'Maelstrome26') {
            throw new HealthCheckError('database', this.getStatus('database', false, ['Character data did not match name correctly, or character did not return. Something is wrong!', character]));
        }

        return this.getStatus('database', true, character.character);
    }
}
