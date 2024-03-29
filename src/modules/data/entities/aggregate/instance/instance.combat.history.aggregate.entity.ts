/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectId} from 'typeorm';
import CombatStats from '../common/combat.stats.embed';
import {Ps2AlertsEventType} from '../../../ps2alerts-constants/ps2AlertsEventType';

@Entity({
    name: 'aggregate_instance_combat_histories',
})
@Index(['instance', 'timestamp', 'ps2AlertsEventType'], {unique: true})
export default class InstanceCombatHistoryAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    @ApiHideProperty()
    _id: ObjectId;

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
