/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import FacilityFactionControl from '../common/facility.faction.control.embed';
import FacilityEmbed from '../common/facility.embed';
import {Ps2AlertsEventType} from '../../../ps2alerts-constants/ps2AlertsEventType';

@Entity({
    name: 'aggregate_instance_facility_controls',
})
@Index(['instance', 'facility.id', 'ps2AlertsEventType'], {unique: true})
@Index(['facility.id'])
@Index(['ps2AlertsEventType'])
export default class InstanceFacilityControlAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({type: FacilityEmbed, description: 'Facility details'})
    @Column(() => FacilityEmbed)
    facility: FacilityEmbed;

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

    @ApiProperty({
        example: Ps2AlertsEventType.LIVE_METAGAME,
        description: 'PS2Alerts Event Type for the aggregate',
    })
    @Column({
        type: 'number',
        default: Ps2AlertsEventType.LIVE_METAGAME,
    })
    ps2AlertsEventType: Ps2AlertsEventType;
}
