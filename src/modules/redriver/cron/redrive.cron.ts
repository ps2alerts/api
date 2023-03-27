/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import RedriveRequestEntity, {RedriveStatus} from '../../data/entities/redrive/redrive.request.entity';
import {Rest} from 'ps2census';

@Injectable()
export class RedriveCron {
    private readonly logger = new Logger(RedriveCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Cron('*/5 * * * * *') // Every 60 seconds
    async handleCron(): Promise<void> {
        this.logger.log('Running Redrive cron job');

        // Abort if there are any redrives in progress as this is likely to cause issues
        const runningRedrives: RedriveRequestEntity[] = await this.mongoOperationsService.findMany(RedriveRequestEntity, {status: RedriveStatus.RUNNING});

        if (runningRedrives.length > 0) {
            // If the redrive is already running, simply log it and return the status
            for (const redrive of runningRedrives) {
                this.logger.log(`Redrive W:${redrive.world} D:${redrive.dateStart.toString()} -> ${redrive.dateEnd.toString()}: ${redrive.processed ?? '?'} / ${redrive.totalToProcess ?? '?'} processed`);
            }

            return;
        }

        // Firstly, get the list of redrives available
        const redrives: RedriveRequestEntity[] = await this.mongoOperationsService.findMany(RedriveRequestEntity, {status: RedriveStatus.PENDING});

        // Loop through each and run the redrive
        for (const redrive of redrives) {
            this.logger.log(`Starting redrive for World ${redrive.world} on ${redrive.dateStart.toString()} to ${redrive.dateEnd.toString()}`);

            // Calculate the number of metagames for the date range

            // Mark the redrive as running
            redrive.status = RedriveStatus.RUNNING;
            await this.mongoOperationsService.upsert(
                RedriveRequestEntity,
                [{$set: {status: RedriveStatus.RUNNING}}],
                [{_id: redrive._id}],
            );
        }
    }

    async calculateMetagamesForDateRange(world: number, dateStart: Date, dateEnd: Date): Promise<void> {
        // Convert date objects to unix timestamps
        const dateStartUnix = Math.floor(dateStart.getTime() / 1000);
        const dateEndUnix = Math.floor(dateEnd.getTime() / 1000);

        // Get the metagame events for the date range
        const client = new Rest.Client('ps2', {serviceId: 'ps2alertsdotcom'});

        await client.get('world_event', {
            world_id: world.toString(),
            event_type: 'METAGAME',
            start: dateStartUnix,
            end: dateEndUnix,

        }).then(() => {
            // console.log(response);
        });
    }
}
