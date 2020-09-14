import {Column, ObjectIdColumn, Entity, ObjectID} from "typeorm";
import {FactionCombat} from "../common/combatstats.embed";

@Entity()
export default class FactionCombat {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
    })
    instance: string;

    @Column(() => FactionCombat)
    vs: FactionCombat;

    @Column(() => FactionCombat)
    nc: FactionCombat;

    @Column(() => FactionCombat)
    tr: FactionCombat;

    @Column(() => FactionCombat)
    nso: FactionCombat;

    @Column(() => FactionCombat)
    totals: FactionCombat;
}
