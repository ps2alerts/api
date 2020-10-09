/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {Faction, factionArray} from '../../constants/faction.consts';

@Entity({
    name: 'instance_facility_controls',
})
@Index(['instance', 'facility', 'timestamp'], {unique: true})
export default class InstanceFacilityControlEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({example: 222, description: 'Facility ID'})
    @Column({
        type: 'number',
    })
    facility: number;

    @ApiProperty({example: new Date(), description: 'Time of event instance in UTC'})
    @Column({
        type: 'date',
    })
    timestamp: Date;

    @ApiProperty({enum: factionArray, description: 'Losing faction that lost control of the facility'})
    @Column({
        type: 'enum',
        enum: factionArray,
    })
    oldFaction: Faction;

    @ApiProperty({enum: factionArray, description: 'Winning faction that took control of the facility'})
    @Column({
        type: 'enum',
        enum: factionArray,
    })
    newFaction: Faction;

    @ApiProperty({example: 0, description: 'Time taken to capture/defend the facility'})
    @Column({
        type: 'number',
        default: 0,
    })
    durationHeld: number;

    @ApiProperty({example: false, description: 'Defended successfully'})
    @Column({
        type: 'boolean',
    })
    isDefence: boolean;

    @ApiProperty({example: '37537074285161814', description: 'Outfit ID of the outfit that captured the facility'})
    @Column({
        type: 'string',
        nullable: true,
        default: null,
    })
    outfitCaptured?: string;
}
