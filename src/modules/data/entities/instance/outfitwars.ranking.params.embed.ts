/* eslint-disable @typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

export default class OutfitwarsRankingParamsEmbed {
    @ApiProperty({
        example: 30444,
        description: 'Total number of points this outfit has accrued',
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
        example: 3,
        description: 'Total number of matches an outfit has won',
    })
    @Column({
        type: 'number',
    })
    Wins: number;

    @ApiProperty({
        example: 1,
        description: 'Total number of matches an outfit has lost',
    })
    @Column({
        type: 'number',
    })
    Losses: number;

    @ApiProperty({
        example: 444,
        description: 'Total number of tiebreaker points an outfit has earned',
    })
    @Column({
        type: 'number',
    })
    TiebreakerPoints: number;

    @ApiProperty({
        example: 0,
        description: 'Rank among own faction',
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
