/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../ps2alerts-constants/world';
import {Zone, zoneArray} from '../../ps2alerts-constants/zone';
import {MetagameEventType, metagameEventTypeArray} from '../../ps2alerts-constants/metagameEventType';
import {Ps2AlertsEventState, ps2AlertsEventStateArray} from '../../ps2alerts-constants/ps2AlertsEventState';
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import MetagameTerritoryResultEmbed from '../aggregate/common/metagame.territory.result.embed';
import {Bracket, ps2alertsBracketArray} from '../../ps2alerts-constants/bracket';
import InstanceFeaturesEmbed from './instance.features.embed';
import {Ps2AlertsEventType, ps2AlertsEventTypeArray} from '../../ps2alerts-constants/ps2AlertsEventType';

@Entity({
    name: 'instance_metagame_territories',
})
@Index(['world', 'censusInstanceId'], {unique: true})
@Index(['instanceId'])
@Index(['zone'])
@Index(['state'])
export default class InstanceMetagameTerritoryEntity {
    @ObjectIdColumn()
    @Exclude()
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: ObjectID;

    @ApiProperty({enum: worldArray, example: 10, description: 'Server / World ID'})
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @ApiProperty({example: '10-12345', description: 'An ID as reported to us from Census. This in combination with world gives us a unique identifier.'})
    @Column({
        type: 'number',
    })
    censusInstanceId: number;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination to create a unique metagame instance ID that\'s human readable'})
    @Column({
        type: 'string',
    })
    instanceId: string;

    @ApiProperty({enum: zoneArray, description: 'Continent / Zone ID'})
    @Column({
        type: 'enum',
        enum: zoneArray,
    })
    zone: Zone;

    @ApiProperty({example: new Date(), description: 'Time the metagame instance started in UTC'})
    @Column({
        type: 'date',
    })
    timeStarted: Date;

    @ApiProperty({example: new Date(), description: 'Time the metagame instance ended in UTC'})
    @Column({
        type: 'date',
        nullable: true,
    })
    timeEnded?: Date;

    @ApiProperty({enum: metagameEventTypeArray, description: 'The census metagame event type. This is what we use to determine what kind of alert this is (e.g. meltdown or not)'})
    @Column({
        type: 'enum',
        enum: metagameEventTypeArray,
    })
    censusMetagameEventType: MetagameEventType;

    @ApiProperty({example: 54000000, description: 'The expected duration of the metagame instance in miliseconds. This is usually either 1:30 or 0:45 hours.'})
    @Column({
        type: 'number',
    })
    duration: number;

    @ApiProperty({example: Ps2AlertsEventState.ENDED, enum: ps2AlertsEventStateArray, description: 'The internal event state. 0 = starting, 1 = in progress, 2 = finished'})
    @Column({
        type: 'enum',
        enum: ps2AlertsEventStateArray,
    })
    state: Ps2AlertsEventState;

    @ApiProperty({
        example: Ps2AlertsEventType.LIVE_METAGAME,
        enum: ps2AlertsEventTypeArray,
        description: 'The event type identifier - this is used to filter by live metagame and outfitwars etc',
    })
    @Column({
        type: 'number',
        enum: ps2AlertsEventTypeArray,
    })
    ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME;

    @ApiProperty({example: Bracket.PRIME, enum: ps2alertsBracketArray, description: 'Activity bracket level of the instance'})
    @Column({
        type: 'enum',
        enum: ps2alertsBracketArray,
    })
    bracket: Bracket;

    @ApiProperty({description: 'Victory data for the instance'})
    @Column(() => MetagameTerritoryResultEmbed)
    result: MetagameTerritoryResultEmbed;

    @ApiProperty({description: 'Enabled features / data for this instance'})
    @Column(() => InstanceFeaturesEmbed)
    features: InstanceFeaturesEmbed;

    @ApiProperty({example: '1.0', description: 'The map\'s version, which enables us to provide different map tiles for historical alerts'})
    @Column({
        type: 'string',
    })
    mapVersion: string;

    @ApiProperty({example: '1.0', description: 'The lattice\'s version, which enables us to provide different lattice layouts for historical alerts'})
    @Column({
        type: 'string',
    })
    latticeVersion: string;
}
