import XperminuteEmbed from './xperminute.embed';
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

export default class XperminuteOutfitEmbed extends XperminuteEmbed {
    @ApiProperty({example: 3.47, description: 'Kills per minute per participant made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    killsPerMinutePerParticipant: number;

    @ApiProperty({example: 2.69, description: 'Deaths per minute per participant made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    deathsPerMinutePerParticipant: number;

    @ApiProperty({example: 0.16, description: 'Team Kills per minute per participant made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    teamKillsPerMinutePerParticipant: number;

    @ApiProperty({example: 0.03, description: 'Suicides per minute per participant made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    suicidesPerMinutePerParticipant: number;

    @ApiProperty({example: 0.88, description: 'Headshots per minute per participant made using the durationFirstSeen value'})
    @Column({
        type: 'number',
    })
    headshotsPerMinutePerParticipant: number;
}
