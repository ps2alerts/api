import { Column, ObjectIdColumn, Entity, Index, ObjectID } from 'typeorm';
import FacilityFactionControl from '../common/facilityfactioncontrol.embed';

@Entity({
  name: 'aggregate_instance_facilitycontrol'
})
@Index(['instance', 'facility'], { unique: true })
export default class FactionsFacilityControl {
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
