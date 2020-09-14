import {Column, ObjectIdColumn, Entity, ObjectID} from "typeorm";
import {World, worldArray} from '../../../constants/world.consts';
import FactionCombat from "../common/combatstats.embed";

@Entity()
export default class FactionsCombat {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "enum",
        enum: worldArray,
    })
    world: World;

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

