import { Column, ObjectIdColumn, Entity, Index, ObjectID } from 'typeorm';

@Entity()
@Index(['instance', 'world'], { unique: true })
export default class Character {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column({
    type: 'string',
  })
  instance: string;

  @Column({
    type: 'string',
  })
  character: string;

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

  @Column({
    type: 'string',
    nullable: true,
  })
  outfit?: string;
}
