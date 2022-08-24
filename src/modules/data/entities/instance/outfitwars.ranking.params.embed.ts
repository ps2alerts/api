import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';
import LithaFalconOutfitWarRankingParametersInterface from '../../ps2alerts-constants/interfaces/LithaFalconOutfitWarRankingParametersInterface';

export default class OutfitwarsRankingParamsEmbed implements LithaFalconOutfitWarRankingParametersInterface {
    @ApiProperty({
        example: 2,
        description: 'Total number of match wins for this outfit',
    })
    @Column({
        type: 'number',
    })
    TotalScore: number;

    @ApiProperty({
        example: 4,
        description: 'Total number of matches an outfit has played',
    })
    @Column({
        type: 'number',
    })
    MatchesPlayed: number;

    @ApiProperty({
        example: 500,
        description: 'Total number of VictoryPoints an outfit has accrued, used in tie-breakers',
    })
    @Column({
        type: 'number',
    })
    VictoryPoints: number;

    @ApiProperty({
        example: 0,
        description: 'Whether the outfit has won the Gold medal',
    })
    @Column({
        type: 'number',
    })
    Gold: number;

    @ApiProperty({
        example: 0,
        description: 'Whether the outfit has won the Silver medal',
    })
    @Column({
        type: 'number',
    })
    Silver: number;

    @ApiProperty({
        example: 0,
        description: 'Whether the outfit has won the Bronze medal',
    })
    @Column({
        type: 'number',
    })
    Bronze: number;

    @ApiProperty({
        example: 0,
        description: 'Rank among the outfit\'s faction',
    })
    @Column({
        type: 'number',
    })
    FactionRank: number;

    @ApiProperty({
        example: 0,
        description: 'Rank among all outfits on the same server, from high to low',
    })
    @Column({
        type: 'number',
    })
    GlobalRank: number;
}