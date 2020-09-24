/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, ObjectID, Index} from 'typeorm';
import {World, worldArray} from '../../../constants/world.consts';
import CombatStats from '../common/combatstats.embed';

@Entity({
    name: 'aggregate_global_faction_combats',
})
@Index(['world'], {unique: true})
export default class GlobalFactionCombatAggregate {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @Column(() => CombatStats)
    vs: CombatStats;

    @Column(() => CombatStats)
    nc: CombatStats;

    @Column(() => CombatStats)
    tr: CombatStats;

    @Column(() => CombatStats)
    nso: CombatStats;

    @Column(() => CombatStats)
    totals: CombatStats;
}
