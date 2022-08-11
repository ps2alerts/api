import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

export default class OutfitwarsMapControlEmbed {
    @ApiProperty({example: 20, description: 'Team 1 (blue) percentage'})
    @Column({
        type: 'number',
    })
    blue: number;

    @ApiProperty({example: 35, description: 'Team 2 (red) percentage'})
    @Column({
        type: 'number',
    })
    team: number;

    @ApiProperty({example: 0, description: 'Cutoff bases Percentage'})
    @Column({
        type: 'number',
    })
    cutoff: number;

    // This will likely always be zero
    @ApiProperty({example: 0, description: 'Out of play percentage'})
    @Column({
        type: 'number',
    })
    outOfPlay: number;
}
