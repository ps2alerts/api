import {ApiProperty} from '@nestjs/swagger';

export default class XperminuteEmbed {
    @ApiProperty({type: Number, example: 3.47, description: 'Kills per minute made using the durationFirstSeen value'})
    killsPerMinute: number;

    @ApiProperty({type: Number, example: 2.69, description: 'Deaths per minute made using the durationFirstSeen value'})
    deathsPerMinute: number;

    @ApiProperty({type: Number, example: 0.16, description: 'Team Kills per minute made using the durationFirstSeen value'})
    teamKillsPerMinute: number;

    @ApiProperty({type: Number, example: 0.03, description: 'Suicides per minute made using the durationFirstSeen value'})
    suicidesPerMinute: number;

    @ApiProperty({type: Number, example: 0.88, description: 'Headshots per minute made using the durationFirstSeen value'})
    headshotsPerMinute: number;
}
