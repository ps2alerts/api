/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';
import {Zone} from '../../../constants/zone.consts';

export default class FacilityEmbed {
    @ApiProperty({example: '6200', description: 'Facility ID'})
    @Column({
        type: 'string',
    })
    id: string;

    @ApiProperty({example: 'The Crown', description: 'Facility name'})
    @Column({
        type: 'string',
    })
    name: string;

    @ApiProperty({example: 5, description: 'Facility type id'})
    @Column({
        type: 'number',
    })
    type: number;

    @ApiProperty({example: 2, description: 'Zone ID'})
    @Column({
        type: 'number',
    })
    zone: Zone;

    @ApiProperty({example: 2306, description: 'Facility map region ID'})
    @Column({
        type: 'number',
    })
    region: number;
}
