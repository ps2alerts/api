/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../../constants/world.consts';
import OutfitEmbed from '../common/outfit.embed';
import {Bracket, bracketArray} from '../../../constants/bracket.consts';

@Entity({
    name: 'aggregate_global_outfits',
})
@Index(['world', 'outfit.id', 'bracket'], {unique: true})
@Index(['outfit.id'])
@Index(['bracket'])
export default class GlobalOutfitAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({type: OutfitEmbed, description: 'Outfit details'})
    @Column(() => OutfitEmbed)
    outfit: OutfitEmbed;

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

    @ApiProperty({example: 22, description: 'Total number of kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    kills: number;

    @ApiProperty({example: 18, description: 'Total number of deaths'})
    @Column({
        type: 'number',
        default: 0,
    })
    deaths: number;

    @ApiProperty({example: 3, description: 'Total number of team kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    teamKills: number;

    @ApiProperty({example: 5, description: 'Total number of times teamkilled'})
    @Column({
        type: 'number',
        default: 0,
    })
    teamKilled: number;

    @ApiProperty({example: 2, description: 'Total number of suicides'})
    @Column({
        type: 'number',
        default: 0,
    })
    suicides: number;

    @ApiProperty({example: 15, description: 'Total number of headshots'})
    @Column({
        type: 'number',
        default: 0,
    })
    headshots: number;

    @ApiProperty({example: 10, description: 'Number of facility captures made by this outfit'})
    @Column({
        type: 'number',
        default: 0,
    })
    captures: number;
}
