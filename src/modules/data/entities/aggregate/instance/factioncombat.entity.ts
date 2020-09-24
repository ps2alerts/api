/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, ObjectID, Index} from 'typeorm';
import CombatStats from '../common/combatstats.embed';

@Entity({
    name: 'aggregate_instance_faction_combats',
})
@Index(['instance'], {unique: true})
export default class FactionCombat {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: 'string',
    })
    instance: string;

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
