/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import OutfitEmbed from '../aggregate/common/outfit.embed';
import OutfitwarsRankingParamsEmbed from './outfitwars.ranking.params.embed';

@Entity({
    name: 'outfitwars_rankings',
})
@Index(['outfitWarId', 'roundId', 'timestamp', 'outfit.id'], {unique: true})
export default class OutfitwarsRankingEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({example: new Date(), description: 'Time of ranking retrieval in UTC'})
    @Column({
        type: 'date',
    })
    timestamp: Date;

    @ApiProperty({example: 1, description: 'World'})
    @Column({
        type: 'number',
    })
    world: number;

    @ApiProperty({example: 35, description: 'Outfit War Unique ID'})
    @Column({
        type: 'number',
    })
    outfitWarId: number;

    @ApiProperty({example: '339330750175136104', description: 'Outfit War Round Unique ID'})
    @Column({
        type: 'string',
    })
    roundId: string;

    @ApiProperty({
        example: {
            "id" : "37570391403474491",
            "name" : "Un1ty",
            "faction" : 3,
            "world" : 1,
            "leader" : "5428482802434229601",
            "tag" : "UN17"
        }, 
        description: 'Outfit information'})
    @Column(() => OutfitEmbed)
    outfit: OutfitEmbed;

    @ApiProperty({
        example: {
            "TotalScore": 0,
            "MatchesPlayed": 0,
            "VictoryPoints": 0,
            "Gold": 0,
            "Silver": 0,
            "Bronze": 0,
            "FactionRank": 0,
            "GlobalRank": 12
        },
        description: 'The ranking parameters used to determine an outfit\'s place on the leader boards'})
    @Column(() => OutfitwarsRankingParamsEmbed)
    rankingParameters: OutfitwarsRankingParamsEmbed;

    @ApiProperty({example: 6, description: 'The order by which outfits signed up for this outfit war'})
    @Column({
        type: 'number',
    })
    order: number;
}
