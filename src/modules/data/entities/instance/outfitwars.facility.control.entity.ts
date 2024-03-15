/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectId} from 'typeorm';
import {outfitWarsTeamArray, Team} from '../../ps2alerts-constants/outfitwars/team';
import OutfitWarsTerritoryResultEmbed from '../aggregate/common/outfitwars.territory.result.embed';

@Entity({
    name: 'outfitwars_facility_controls',
})
@Index(['instance', 'facility', 'timestamp'], {unique: true})
export default class OutfitwarsFacilityControlEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectId;

    @ApiProperty({example: 'outfitwars-1-10-34709', description: 'Unique outfitwars identifier'})
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

    @ApiProperty({enum: outfitWarsTeamArray, description: 'Losing team that lost control of the facility'})
    @Column({
        type: 'enum',
        enum: outfitWarsTeamArray,
    })
    oldFaction: Team;

    @ApiProperty({enum: outfitWarsTeamArray, description: 'Winning team that took control of the facility'})
    @Column({
        type: 'enum',
        enum: outfitWarsTeamArray,
    })
    newFaction: Team;

    @ApiProperty({example: 0, description: 'Time since last capture / defense event (in seconds)'})
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

    @ApiProperty({example: false, description: 'If this record is the part of the initial map state at the start of the alert.'})
    @Column({
        type: 'boolean',
    })
    isInitial: boolean;

    @ApiProperty({example: '37509488620604883', description: 'Outfit ID of the outfit that captured the facility'})
    @Column({
        type: 'string',
        nullable: true,
        default: null,
    })
    outfitCaptured?: string | null;

    @ApiProperty({type: OutfitWarsTerritoryResultEmbed, description: 'Snapshot of the territory control at the point of capture (outfitwars version)'})
    @Column(() => OutfitWarsTerritoryResultEmbed)
    mapControl: OutfitWarsTerritoryResultEmbed;
}
