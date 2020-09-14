import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";
import {World, worldArray} from '../../../constants/world.consts';
import Facilitycontrol from "../common/facilitycontrol.embed";

@Entity()
@Index(["facility", "world"], {unique: true})
export default class FacilityControl {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "number",
    })
    facility: number;

    @Column({
        type: "enum",
        enum: worldArray,
    })
    world: World;

    @Column(() => Facilitycontrol)
    vs: Facilitycontrol;

    @Column(() => Facilitycontrol)
    nc: Facilitycontrol;

    @Column(() => Facilitycontrol)
    tr: Facilitycontrol;

    // No NSO, they cannot capture bases on behalf of their faction. Their outfits can though strangely!

    @Column(() => Facilitycontrol)
    totals: Facilitycontrol;
}
