import {Column} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';

export default class VehicleStatsEmbed {
    @ApiProperty({example: 22, description: 'Total number of kills for parent metric'})
    @Column({
        type: 'number',
    })
    kills: number;

    @ApiProperty({example: 22, description: 'Total number of deaths for parent metric'})
    @Column({
        type: 'number',
    })
    deaths: number;

    @ApiProperty({example: 22, description: 'Total number of teamkills for parent metric'})
    @Column({
        type: 'number',
    })
    teamkills: number;

    @ApiProperty({example: 22, description: 'Total number of times teamkilled for parent metric'})
    @Column({
        type: 'number',
    })
    teamkilled: number;
}
