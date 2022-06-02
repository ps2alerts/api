import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

export default class XperminuteEmbed {
    @ApiProperty({example: 3.47, description: 'Kills per minute made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    killsPerMinute: number;

    @ApiProperty({example: 2.69, description: 'Deaths per minute made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    deathsPerMinute: number;

    @ApiProperty({example: 0.16, description: 'Team Kills per minute made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    teamKillsPerMinute: number;

    @ApiProperty({example: 0.03, description: 'Suicides per minute made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    suicidesPerMinute: number;

    @ApiProperty({example: 0.88, description: 'Headshots per minute made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    headshotsPerMinute: number;
}
