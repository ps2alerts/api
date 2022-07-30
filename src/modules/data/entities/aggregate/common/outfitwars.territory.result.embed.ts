/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';
import {Team, outfitWarsTeamArray} from '../../../ps2alerts-constants/outfitWarsTeam';
import OutfitWarsTeamsEmbed from './outfitwars.teams.embed';

export default class OutfitWarsTerritoryResultEmbed {
    @ApiProperty({example: 33, description: 'Red team capture percentage'})
    @Column({
        type: 'number',
    })
    red: number;

    @ApiProperty({example: 33, description: 'Blue team capture percentage'})
    @Column({
        type: 'number',
    })
    blue: number;

    @ApiProperty({example: 33, description: 'Percentage of bases cut off from warpgates (which don\'t contribute to faction score)'})
    @Column({
        type: 'number',
    })
    cutoff: number;

    @ApiProperty({example: Team.RED, enum: outfitWarsTeamArray, description: 'victor of the instance. 1 = Red, 2 = Blue'})
    @Column({
        type: 'number',
        enum: outfitWarsTeamArray,
    })
    victor: Team;

    @ApiProperty({example: false, description: 'Per base capture worth in percentage'})
    @Column({
        type: 'decimal',
        precision: 2,
        scale: 2,
    })
    perBasePercentage: number;

    @ApiProperty({description: 'Victory data for the instance'})
    @Column(() => OutfitWarsTeamsEmbed)
    outfits: OutfitWarsTeamsEmbed;
}
