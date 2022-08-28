/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, ObjectID, Index} from 'typeorm';
import {World, worldArray} from '../../../ps2alerts-constants/world';
import CombatStats from '../common/combat.stats.embed';
import {Bracket, ps2alertsBracketArray} from '../../../ps2alerts-constants/bracket';
import FactionVersusFactionEmbed from '../common/faction.versus.faction.embed';
import {Ps2alertsEventType} from '../../../ps2alerts-constants/ps2alertsEventType';

@Entity({
    name: 'aggregate_global_faction_combats',
})
@Index(['world', 'date', 'bracket', 'ps2AlertsEventType'], {unique: true})
@Index(['date'])
@Index(['bracket'])
@Index(['ps2AlertsEventType'])
export default class GlobalFactionCombatAggregateEntity {
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

    @ApiProperty({example: '2020-01-01', description: 'Date of the aggregate in UTC'})
    @Column({
        type: 'date',
    })
    date: Date;

    @ApiProperty({type: CombatStats, description: 'Combat Statistics for VS faction'})
    @Column(() => CombatStats)
    vs: CombatStats;

    @ApiProperty({type: CombatStats, description: 'Combat Statistics for NC faction'})
    @Column(() => CombatStats)
    nc: CombatStats;

    @ApiProperty({type: CombatStats, description: 'Combat Statistics for TR faction'})
    @Column(() => CombatStats)
    tr: CombatStats;

    @ApiProperty({type: CombatStats, description: 'Combat Statistics for NSO faction'})
    @Column(() => CombatStats)
    nso: CombatStats;

    @ApiProperty({type: CombatStats, description: 'Combat Statistics for all factions'})
    @Column(() => CombatStats)
    totals: CombatStats;

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
