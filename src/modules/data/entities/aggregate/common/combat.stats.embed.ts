/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

export default class CombatStatsEmbed {
    @ApiProperty({example: 22, description: 'Total number of kills'})
    @Column({
        type: 'number',
    })
    kills: number;

    @ApiProperty({example: 18, description: 'Total number of deaths'})
    @Column({
        type: 'number',
    })
    deaths: number;

    @ApiProperty({example: 3, description: 'Total number of team kills'})
    @Column({
        type: 'number',
    })
    teamKills: number;

    @ApiProperty({example: 2, description: 'Total number of suicides'})
    @Column({
        type: 'number',
    })
    suicides: number;

    @ApiProperty({example: 15, description: 'Total number of headshots'})
    @Column({
        type: 'number',
    })
    headshots: number;
}
