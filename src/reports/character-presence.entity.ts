import {Unique, Column, ObjectIdColumn, Entity, ObjectID} from "typeorm";
import {World, worldArray} from '../constants/world';
import {Zone, zoneArray} from '../constants/zone';
import {Faction, factionArray} from '../constants/faction';

@Entity()
@Unique(["character"])
export class CharacterPresenceEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
        nullable: false
    })
    character: string;

    @Column({
        type: "enum",
        enum: worldArray,
        nullable: false
    })
    world: World;

    @Column({
        type: "enum",
        enum: zoneArray,
        nullable: true
    })
    zone?: Zone;

    @Column({
        type: "enum",
        enum: factionArray,
        nullable: false
    })
    faction: Faction;

    @Column({
        type: "date",
        nullable: false
    })
    lastSeen: Date;
}
