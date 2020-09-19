import { Column, ObjectIdColumn, Entity, ObjectID } from 'typeorm';
import CombatStats from '../common/combatstats.embed';

@Entity()
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

  @Column(() => FactionCombat)
  totals: FactionCombat;
}
