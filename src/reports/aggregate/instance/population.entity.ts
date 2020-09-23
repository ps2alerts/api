import { Column, ObjectIdColumn, Entity, Index, ObjectID } from 'typeorm';

@Entity({
  name: 'aggregate_instance_population'
})
@Index(['instance', 'timestamp'], { unique: true })
export default class Population {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column({
    type: 'string',
  })
  instance: string;

  @Column({
    type: 'date',
  })
  timestamp: Date;

  @Column({
    type: 'number',
    default: 0,
  })
  vs: number;

  @Column({
    type: 'number',
    default: 0,
  })
  nc: number;

  @Column({
    type: 'number',
    default: 0,
  })
  tr: number;

  @Column({
    type: 'number',
    default: 0,
  })
  nso: number;

  @Column({
    type: 'number',
    default: 0,
  })
  total: number;
}
