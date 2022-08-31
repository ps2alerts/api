/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, ObjectID} from 'typeorm';
import OutfitEmbed from '../aggregate/common/outfit.embed';
import OutfitwarsRankingParamsEmbed from './outfitwars.ranking.params.embed';
import {World} from '../../ps2alerts-constants/world';

@Entity({
    name: 'outfitwars_rankings',
})
export default class OutfitwarsRankingEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({example: new Date(), description: 'Time of ranking retrieval in UTC'})
    @Column({
        type: 'date',
    })
    timestamp: Date;

    @ApiProperty({example: 1, description: 'The round during which this ranking was created'})
    @Column({
        type: 'number',
    })
    round: number;

    @ApiProperty({example: 1, description: 'World'})
    @Column({
        type: 'number',
    })
    world: World;

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

    @ApiProperty({example: 6, description: 'The order by which outfits signed up for this outfit war'})
    @Column({
        type: 'number',
    })
    order: number;

    @ApiProperty({example: 'outfitwars-1-10-25939', description: 'The instance corresponding to the match this outfit played in this round'})
    @Column({
        type: 'string',
        nullable: true
    })
    instanceId: string | null;

    @ApiProperty({example: {
        id: '37570391403474491',
        name: 'Un1ty',
        faction: 3,
        world: 1,
        leader: '5428482802434229601',
        tag: 'UN17',
    },
    description: 'Outfit information'})
    @Column(() => OutfitEmbed)
    outfit: OutfitEmbed;

    @ApiProperty({example: {
        TotalScore: 0,
        MatchesPlayed: 0,
        VictoryPoints: 0,
        Gold: 0,
        Silver: 0,
        Bronze: 0,
        FactionRank: 0,
        GlobalRank: 12,
    },
    description: 'The ranking parameters used to determine an outfit\'s place on the leader boards'})
    @Column(() => OutfitwarsRankingParamsEmbed)
    rankingParameters: OutfitwarsRankingParamsEmbed;
}
