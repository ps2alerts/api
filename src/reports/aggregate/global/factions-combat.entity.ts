import {Column, ObjectIdColumn, Entity, ObjectID} from "typeorm";
import {World, worldArray} from '../../../constants/world';
import {FactionCombat} from "../common/faction-combat";

@Entity()
export class FactionsCombatEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "enum",
        enum: worldArray,
        nullable: false
    })
    world: World;

    @Column(type => FactionCombat)
    vs: FactionCombat;

    @Column(type => FactionCombat)
    nc: FactionCombat;

    @Column(type => FactionCombat)
    tr: FactionCombat;

    @Column(type => FactionCombat)
    nso: FactionCombat;

    @Column(type => FactionCombat)
    totals: FactionCombat;
}

