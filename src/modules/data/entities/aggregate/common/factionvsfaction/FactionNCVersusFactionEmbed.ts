/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';

export default class FactionNCVersusFactionEmbed {
    @ApiProperty({example: 123, description: 'Count for VS'})
    @Column({
        type: 'number',
    })
    vs: number;

    @ApiProperty({example: 123, description: 'Count for TR'})
    @Column({
        type: 'number',
    })
    tr: number;

    @ApiProperty({example: 123, description: 'Count for NSO'})
    @Column({
        type: 'number',
    })
    nso: number;
}
