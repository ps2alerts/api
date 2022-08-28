/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Loadout, loadoutArray} from '../../../ps2alerts-constants/loadout';
import {World, worldArray} from '../../../ps2alerts-constants/world';
import {Bracket, ps2alertsBracketArray} from '../../../ps2alerts-constants/bracket';
import FactionVersusFactionEmbed from '../common/faction.versus.faction.embed';
import {Ps2alertsEventType} from '../../../ps2alerts-constants/ps2alertsEventType';

@Entity({
    name: 'aggregate_global_loadouts',
})
@Index(['world', 'loadout', 'bracket', 'ps2AlertsEventType'], {unique: true})
@Index(['loadout'])
@Index(['bracket'])
@Index(['ps2AlertsEventType'])
export default class GlobalLoadoutAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({enum: worldArray, example: 10, description: 'Server / World ID'})
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @ApiProperty({example: Bracket.PRIME, enum: ps2alertsBracketArray, description: 'Activity bracket level of the Aggregate'})
    @Column({
        type: 'enum',
        enum: ps2alertsBracketArray,
    })
    bracket: Bracket;

    @ApiProperty({enum: loadoutArray, example: 3, description: 'Loadout ID'})
    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    loadout: Loadout;

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
        example: Ps2alertsEventType.LIVE_METAGAME,
        description: 'PS2Alerts Event Type for the aggregate',
    })
    @Column({
        type: 'number',
        default: Ps2alertsEventType.LIVE_METAGAME,
    })
    ps2AlertsEventType: Ps2alertsEventType;
}
