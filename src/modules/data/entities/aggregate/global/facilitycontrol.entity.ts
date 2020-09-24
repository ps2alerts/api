/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../../constants/world.consts';
import FacilityFactionControl from '../common/facilityfactioncontrol.embed';

@Entity({
    name: 'aggregate_global_facility_controlss',
})
@Index(['facility', 'world'], {unique: true})
export default class FacilityControl {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: 'number',
    })
    facility: number;

    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @Column(() => FacilityFactionControl)
    vs: FacilityFactionControl;

    @Column(() => FacilityFactionControl)
    nc: FacilityFactionControl;

    @Column(() => FacilityFactionControl)
    tr: FacilityFactionControl;

    // No NSO, they cannot capture bases on behalf of their faction. Their outfits can though strangely!

    @Column(() => FacilityFactionControl)
    totals: FacilityFactionControl;
}
