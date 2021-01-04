/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {World, worldArray} from '../../../constants/world.consts';
import FacilityFactionControl from '../common/facility.faction.control.embed';
import {Bracket, bracketArray} from '../../../constants/bracket.consts';

@Entity({
    name: 'aggregate_global_facility_controls',
})
@Index(['world', 'facility', 'bracket'], {unique: true})
@Index(['bracket'])
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

    @ApiProperty({example: Bracket.PRIME, enum: bracketArray, description: 'Activity bracket level of the Aggregate'})
    @Column({
        type: 'enum',
        enum: bracketArray,
    })
    bracket: Bracket;

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
