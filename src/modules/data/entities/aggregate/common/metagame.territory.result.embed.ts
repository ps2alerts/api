/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column} from 'typeorm';

export default class MetagameTerritoryResultEmbed {
    @Column({
        type: 'number',
    })
    vs: number;

    @Column({
        type: 'number',
    })
    nc: number;

    @Column({
        type: 'number',
    })
    tr: number;

    @Column({
        type: 'number',
    })
    cutoff: number;

    @Column({
        type: 'boolean',
    })
    draw: boolean;
}
