/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {World, worldArray} from '../../../ps2alerts-constants/world';
import FacilityFactionControl from '../common/facility.faction.control.embed';
import {Bracket, ps2alertsBracketArray} from '../../../ps2alerts-constants/bracket';
import FacilityEmbed from '../common/facility.embed';
import {Ps2AlertsEventType} from '../../../ps2alerts-constants/ps2AlertsEventType';

@Entity({
    name: 'aggregate_global_facility_controls',
})
@Index(['world', 'facility.id', 'bracket', 'ps2AlertsEventType'], {unique: true})
@Index(['bracket'])
@Index(['facility.zone'])
@Index(['ps2AlertsEventType'])
export default class GlobalFacilityControlAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({enum: worldArray, example: 10, description: 'Server / World ID'})
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @ApiProperty({example: Bracket.PRIME, enum: ps2alertsBracketArray, description: 'Activity bracket level of the Aggregate'})
    @Column({
        type: 'enum',
        enum: ps2alertsBracketArray,
    })
    bracket: Bracket;

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
