import { Unique, Column, ObjectIdColumn, Entity, ObjectID } from 'typeorm';
import { World, worldArray } from '../constants/world.consts';
import { Zone, zoneArray } from '../constants/zone.consts';
import { Faction, factionArray } from '../constants/faction.consts';

@Entity({
  name: 'characterpresence'
})
@Unique(['character'])
export default class CharacterPresence {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column({
    type: 'string',
  })
  character: string;

  @Column({
    type: 'enum',
    enum: worldArray,
  })
  world: World;

  @Column({
    type: 'enum',
    enum: zoneArray,
    nullable: true,
  })
  zone?: Zone;

  @Column({
    type: 'enum',
    enum: factionArray,
  })
  faction: Faction;

  @Column({
    type: 'date',
  })
  lastSeen: Date;
}
