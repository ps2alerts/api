/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../ps2alerts-constants/world';
import {Zone, zoneArray} from '../../ps2alerts-constants/zone';
import {MetagameEventType, metagameEventTypeArray} from '../../ps2alerts-constants/metagameEventType';
import {Ps2alertsEventState, ps2alertsEventStateArray} from '../../ps2alerts-constants/ps2alertsEventState';
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import MetagameTerritoryResultEmbed from '../aggregate/common/metagame.territory.result.embed';
import {Bracket, ps2alertsBracketArray} from '../../ps2alerts-constants/bracket';
import InstanceFeaturesEmbed from './instance.features.embed';
import OutfitWarsTerritoryResultEmbed from '../aggregate/common/outfitwars.territory.result.embed';

@Entity({
    name: 'instance_metagame_territories',
})
@Index(['world', 'censusInstanceId'], {unique: true})
@Index(['instanceId'])
@Index(['zone'])
@Index(['state'])
export default class InstanceOutfitWarsTerritoryEntity {
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

    @ApiProperty({example: '12345', description: 'An ID as reported to us from Census. This in combination with world gives us a unique identifier.'})
    @Column({
        type: 'number',
    })
    censusInstanceId: number;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination to create a unique metagame instance ID that\'s human readable'})
    @Column({
        type: 'string',
    })
    instanceId: string;

    @ApiProperty({example: '12345', description: 'An instance ID as reported to us from Census. This in combination with zone ID gives us a unique identifier for an instanced continent.'})
    @Column({
        type: 'number',
    })
    zoneInstanceId: number;

    @ApiProperty({enum: zoneArray, description: 'Continent / Zone ID'})
    @Column({
        type: 'enum',
        enum: zoneArray,
    })
    zone: Zone;

    @ApiProperty({example: new Date(), description: 'Time the Outfit Wars instance started in UTC'})
    @Column({
        type: 'date',
    })
    timeStarted: Date;

    @ApiProperty({example: new Date(), description: 'Time the Outfit Wars instance ended in UTC'})
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

    @ApiProperty({example: 27000000, description: 'The expected duration of the metagame instance in miliseconds. For Outfit Wars 2022 this is 45 minutes.'})
    @Column({
        type: 'number',
    })
    duration: number;

    @ApiProperty({example: Ps2alertsEventState.ENDED, enum: ps2alertsEventStateArray, description: 'The internal event state. 0 = starting, 1 = in progress, 2 = finished'})
    @Column({
        type: 'enum',
        enum: ps2alertsEventStateArray,
    })
    state: Ps2alertsEventState;

    @ApiProperty({example: Bracket.PRIME, enum: ps2alertsBracketArray, description: 'Activity bracket level of the instance'})
    @Column({
        type: 'enum',
        enum: ps2alertsBracketArray,
    })
    bracket: Bracket;

    @ApiProperty({description: 'Victory data for the instance'})
    @Column(() => OutfitWarsTerritoryResultEmbed)
    result: OutfitWarsTerritoryResultEmbed;

    @ApiProperty({description: 'Enabled features / data for this instance'})
    @Column(() => InstanceFeaturesEmbed)
    features: InstanceFeaturesEmbed;

    @ApiProperty({example: '1.0', description: 'The map\'s version, which enables us to provide different map layouts and tiles for historical alerts'})
    @Column({
        type: 'string',
    })
    mapVersion: string;
}
