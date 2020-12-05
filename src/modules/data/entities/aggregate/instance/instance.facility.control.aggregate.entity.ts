/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import FacilityFactionControl from '../common/facility.faction.control.embed';

@Entity({
    name: 'aggregate_instance_facility_controls',
})
@Index(['instance', 'facility'], {unique: true})
@Index(['facility'])
export default class InstanceFacilityControlAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({example: 242, description: 'Facility ID'})
    @Column({
        type: 'number',
    })
    facility: number;

    @ApiProperty({type: FacilityFactionControl, description: 'Facility Capture / Defenses for VS faction'})
    @Column(() => FacilityFactionControl)
    vs: FacilityFactionControl;

    @ApiProperty({type: FacilityFactionControl, description: 'Facility Capture / Defenses for NC faction'})
    @Column(() => FacilityFactionControl)
    nc: FacilityFactionControl;

    @ApiProperty({type: FacilityFactionControl, description: 'Facility Capture / Defenses for TR faction'})
    @Column(() => FacilityFactionControl)
    tr: FacilityFactionControl;

    // No NSO, they cannot capture bases on behalf of their faction. Their outfits can though strangely!

    @ApiProperty({type: FacilityFactionControl, description: 'Facility Capture / Defenses for all factions'})
    @Column(() => FacilityFactionControl)
    totals: FacilityFactionControl;
}
