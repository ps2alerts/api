/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import FacilityFactionControl from '../common/facility.faction.control.embed';

@Entity({
    name: 'aggregate_instance_facility_controls',
})
@Index(['instance', 'facility'], {unique: true})
export default class InstanceFacilityControlAggregateEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: 'string',
    })
    instance: string;

    @Column({
        type: 'number',
    })
    facility: number;

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
