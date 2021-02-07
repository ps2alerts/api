/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';
import FactionVSVersusFactionEmbed from './factionvsfaction/FactionVSVersusFactionEmbed';

export default class FacilityFactionControlEmbed {
    @ApiProperty({example: 3, description: 'Number of Facility captures'})
    @Column({
        type: 'number',
        default: 0,
    })
    captures: number;

    @ApiProperty({example: 1, description: 'Number of Facility defences'})
    @Column({
        type: 'number',
        default: 0,
    })
    defences: number;

    @ApiProperty({
        type: FactionVSVersusFactionEmbed,
        description: 'Facilities taken from other factions',
        example: {nc: 123, tr: 123},
    })
    @Column(() => FactionVSVersusFactionEmbed)
    takenFrom: FactionVSVersusFactionEmbed;

    @ApiProperty({
        type: FactionVSVersusFactionEmbed,
        description: 'Facilities lost to other factions',
        example: {nc: 123, tr: 123},
    })
    @Column(() => FactionVSVersusFactionEmbed)
    lostTo: FactionVSVersusFactionEmbed;
}
