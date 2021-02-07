/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

export default class FactionNSOVersusFactionEmbed {
    @ApiProperty({example: 123, description: 'Count for VS'})
    @Column({
        type: 'number',
    })
    vs: number;

    @ApiProperty({example: 123, description: 'Count for NC'})
    @Column({
        type: 'number',
    })
    nc: number;

    @ApiProperty({example: 123, description: 'Count for TR'})
    @Column({
        type: 'number',
    })
    tr: number;
}
