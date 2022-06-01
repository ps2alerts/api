import XperminuteEmbed from './xperminute.embed';
import {ApiProperty} from '@nestjs/swagger';

export default class XperminuteOutfitEmbed extends XperminuteEmbed {
    @ApiProperty({type: Number, example: 3.47, description: 'Kills per minute per participant made using the durationFirstSeen value'})
    killsPerMinutePerParticipant: number;

    @ApiProperty({type: Number, example: 2.69, description: 'Deaths per minute per participant made using the durationFirstSeen value'})
    deathsPerMinutePerParticipant: number;

    @ApiProperty({type: Number, example: 0.16, description: 'Team Kills per minute per participant made using the durationFirstSeen value'})
    teamKillsPerMinutePerParticipant: number;

    @ApiProperty({type: Number, example: 0.03, description: 'Suicides per minute per participant made using the durationFirstSeen value'})
    suicidesPerMinutePerParticipant: number;

    @ApiProperty({type: Number, example: 0.88, description: 'Headshots per minute per participant made using the durationFirstSeen value'})
    headshotsPerMinutePerParticipant: number;
}
