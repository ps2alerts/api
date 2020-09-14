import { Column, ObjectIdColumn, Entity, Index, ObjectID } from 'typeorm';

@Entity()
@Index(['instance', 'outfit'], { unique: true })
export default class Outfit {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column({
    type: 'string',
  })
  instance: string;

  @Column({
    type: 'string',
  })
  outfit: string;

  @Column({
    type: 'number',
    default: 0,
  })
  kills: number;

  @Column({
    type: 'number',
    default: 0,
  })
  deaths: number;

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
