/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, ObjectID, Index} from 'typeorm';
import {World, worldArray} from '../../../constants/world.consts';
import CombatStats from '../common/combat.stats.embed';

@Entity({
    name: 'aggregate_global_faction_combats',
})
@Index(['world'], {unique: true})
export default class GlobalFactionCombatAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({enum: worldArray, description: 'Server / World ID'})
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

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
}
