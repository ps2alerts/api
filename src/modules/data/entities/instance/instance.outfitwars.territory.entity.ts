/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../ps2alerts-constants/world';
import {Zone, zoneArray} from '../../ps2alerts-constants/zone';
import {Ps2alertsEventState, ps2alertsEventStateArray} from '../../ps2alerts-constants/ps2alertsEventState';
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import InstanceFeaturesEmbed from './instance.features.embed';
import OutfitWarsTerritoryResultEmbed from '../aggregate/common/outfitwars.territory.result.embed';
import {Ps2alertsEventType, ps2alertsEventTypeArray} from '../../ps2alerts-constants/ps2alertsEventType';
import OutfitwarsMetadataEmbed from './outfitwars.metadata.embed';


@Entity({
    name: 'instance_outfitwars_2022',
})
@Index(['world', 'zone', 'zoneInstanceId'], {unique: true})
@Index(['instanceId'])
@Index(['zoneInstanceId'])
@Index(['zone'])
@Index(['state'])
export default class InstanceOutfitWarsTerritoryEntity {
    @ObjectIdColumn()
    @Exclude()
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: ObjectID;

    @ApiProperty({
        example: 'outfitwars-17-10-123',
        description: 'Unique identifier for outfitwars instances that\'s human readable',
    })
    @Column({
        type: 'string',
    })
    instanceId: string;

    @ApiProperty({
        example: World.EMERALD,
        enum: worldArray,
        description: 'Server / World ID',
    })
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @ApiProperty({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        example: Zone.NEXUS,
        enum: zoneArray,
        description: 'Continent / Zone ID',
    })
    @Column({
        type: 'enum',
        enum: zoneArray,
    })
    zone: Zone.NEXUS; // Currently this will always be Nexus

    @ApiProperty({
        example: '12',
        description: 'Incrementing number of instances for the zone in question as deferred by the definitionID',
    })
    @Column({
        type: 'number',
    })
    zoneInstanceId: number;

    @ApiProperty({
        example: new Date(),
        description: 'Time the Outfit Wars instance started in UTC',
    })
    @Column({
        type: 'date',
    })
    timeStarted: Date;

    @ApiProperty({
        example: new Date(),
        description: 'Time the Outfit Wars instance ended in UTC',
    })
    @Column({
        type: 'date',
        nullable: true,
    })
    timeEnded?: Date;

    @ApiProperty({description: 'Victory data for the instance'})
    @Column(() => OutfitWarsTerritoryResultEmbed)
    result: OutfitWarsTerritoryResultEmbed;

    @ApiProperty({
        example: 27000000,
        description: 'The expected duration of the metagame instance in milliseconds. For Outfit Wars 2022 this is 45 minutes.',
    })
    @Column({
        type: 'number',
    })
    duration: number;

    @ApiProperty({
        example: Ps2alertsEventState.ENDED,
        enum: ps2alertsEventStateArray,
        description: 'The internal event state. 0 = starting, 1 = in progress, 2 = finished',
    })
    @Column({
        type: 'enum',
        enum: ps2alertsEventStateArray,
    })
    state: Ps2alertsEventState;

    @ApiProperty({
        example: Ps2alertsEventType.OUTFIT_WARS_AUG_2022,
        enum: ps2alertsEventTypeArray,
        description: 'The event type identifier - this is used to filter by live metagame and outfitwars etc',
    })
    @Column({
        type: 'number',
        enum: ps2alertsEventTypeArray,
    })
    ps2alertsEventType: Ps2alertsEventType.OUTFIT_WARS_AUG_2022;

    @ApiProperty({description: 'Enabled features / data for this instance'})
    @Column(() => InstanceFeaturesEmbed)
    features: InstanceFeaturesEmbed;

    @ApiProperty({
        example: '1.0',
        description: 'The map\'s version, which enables us to provide different map layouts and tiles for historical alerts',
    })
    @Column({
        type: 'string',
    })
    mapVersion: string;

    @ApiProperty({description: 'Outfit Wars team metadata'})
    @Column(() => OutfitwarsMetadataEmbed)
    outfitwars: OutfitwarsMetadataEmbed;
}