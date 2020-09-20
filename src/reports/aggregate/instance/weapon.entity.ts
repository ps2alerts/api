import { Column, ObjectIdColumn, Entity, Index, ObjectID } from 'typeorm';

@Entity({
  name: 'aggregate_instance_weapon'
})
@Index(['instance', 'weapon'], { unique: true })
export default class Weapon {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column({
    type: 'string',
  })
  instance: string;

  @Column({
    type: 'number',
  })
  weapon: number;

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
