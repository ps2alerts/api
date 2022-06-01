/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';

export default class InstanceCharacterXPerMinuteEmbed {
    // For some reason the examples aren't pulled out of embeds of embeds
    @ApiProperty({type: Number, example: 1.35, description: 'Kills per minute made by this character using their durationFirstSeen value'})
    killsPerMinute: number;

    @ApiProperty({type: Number, example: 2.25, description: 'Deaths per minute made by this character using their durationFirstSeen value'})
    deathsPerMinute: number;

    @ApiProperty({type: Number, example: 0.35, description: 'Team Kills per minute made by this character using their durationFirstSeen value'})
    teamKillsPerMinute: number;

    @ApiProperty({type: Number, example: 0.65, description: 'Suicides per minute made by this character using their durationFirstSeen value'})
    suicidesPerMinute: number;
}
