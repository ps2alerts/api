import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

export default class TerritoryControlMapControlEmbed {
    @ApiProperty({example: 20, description: 'VS Capture Percentage'})
    @Column({
        type: 'number',
    })
    vs: number;

    @ApiProperty({example: 35, description: 'NC Capture Percentage'})
    @Column({
        type: 'number',
    })
    nc: number;

    @ApiProperty({example: 45, description: 'TR Capture Percentage'})
    @Column({
        type: 'number',
    })
    tr: number;

    @ApiProperty({example: 0, description: 'Cutoff bases Percentage'})
    @Column({
        type: 'number',
    })
    cutoff: number;

    @ApiProperty({example: 0, description: 'Out of play percentage'})
    @Column({
        type: 'number',
    })
    outOfPlay: number;
}
