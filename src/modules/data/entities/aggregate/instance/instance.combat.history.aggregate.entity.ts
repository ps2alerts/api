/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import CombatStats from '../common/combat.stats.embed';

@Entity({
    name: 'aggregate_instance_combat_histories',
})
@Index(['instance', 'timestamp'], {unique: true})
export default class InstanceCombatHistoryAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({example: new Date(), description: 'Timestamp of the aggregate instance reported in UTC'})
    @Column({
        type: 'date',
    })
    timestamp: Date;

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
