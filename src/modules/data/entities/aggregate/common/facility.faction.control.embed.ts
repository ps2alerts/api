/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

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
}
