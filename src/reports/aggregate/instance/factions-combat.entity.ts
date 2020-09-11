import {Column, ObjectIdColumn, Entity, ObjectID} from "typeorm";
import {FactionCombat} from "../common/faction-combat";

@Entity()
export class FactionCombatEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
        nullable: false
    })
    instance: string;

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
