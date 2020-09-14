import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";
import Facilitycontrol from "../common/facilitycontrol.embed";

@Entity()
@Index(["instance", "facility"], {unique: true})
export default class FactionsFacilityControl {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
    })
    instance: string;

    @Column({
        type: "number",
    })
    facility: number;

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
