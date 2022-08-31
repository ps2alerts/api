/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {Loadout, loadoutArray} from '../../../ps2alerts-constants/loadout';
import FactionVersusFactionEmbed from '../common/faction.versus.faction.embed';
import {Ps2AlertsEventType} from '../../../ps2alerts-constants/ps2AlertsEventType';

@Entity({
    name: 'aggregate_instance_loadouts',
})
@Index(['instance', 'loadout', 'ps2AlertsEventType'], {unique: true})
@Index(['loadout'])
@Index(['ps2AlertsEventType'])
export default class InstanceLoadoutAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({enum: loadoutArray, description: 'Loadout ID'})
    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    loadout: Loadout; // Subject to change to a PlayerInterface

    @ApiProperty({example: 22, description: 'Total number of kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    kills: number;

    @ApiProperty({example: 18, description: 'Total number of deaths'})
    @Column({
        type: 'number',
        default: 0,
    })
    deaths: number;

    @ApiProperty({example: 3, description: 'Total number of team kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    teamKills: number;

    @ApiProperty({example: 5, description: 'Total number of times teamkilled'})
    @Column({
        type: 'number',
        default: 0,
    })
    teamKilled: number;

    @ApiProperty({example: 2, description: 'Total number of suicides'})
    @Column({
        type: 'number',
        default: 0,
    })
    suicides: number;

    @ApiProperty({example: 15, description: 'Total number of headshots'})
    @Column({
        type: 'number',
        default: 0,
    })
    headshots: number;

    @ApiProperty({type: FactionVersusFactionEmbed, description: 'Kills broken down by faction'})
    @Column(() => FactionVersusFactionEmbed)
    factionKills: FactionVersusFactionEmbed;

    @ApiProperty({
        example: Ps2AlertsEventType.LIVE_METAGAME,
        description: 'PS2Alerts Event Type for the aggregate',
    })
    @Column({
        type: 'number',
        default: Ps2AlertsEventType.LIVE_METAGAME,
    })
    ps2AlertsEventType: Ps2AlertsEventType;
}
