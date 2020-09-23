import { Column, ObjectIdColumn, Entity, Index, ObjectID } from 'typeorm';
import { World, worldArray } from '../../../constants/world.consts';

@Entity({
  name: 'aggregate_global_weapon'
})
@Index(['weapon', 'world'], { unique: true })
export default class Weapon {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column({
    type: 'number',
  })
  weapon: number;

  @Column({
    type: 'enum',
    enum: worldArray,
  })
  world: World;

  @Column({
    type: 'number',
    default: 0,
  })
  kills: number;

  @Column({
    type: 'number',
    default: 0,
  })
  teamKills: number;

  @Column({
    type: 'number',
    default: 0,
  })
  suicides: number;

  @Column({
    type: 'number',
    default: 0,
  })
  headshots: number;
}
