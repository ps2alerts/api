/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column} from 'typeorm';
import {Faction} from '../../../constants/faction.consts';

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
        type: 'number',
    })
    winner: Faction;

    @Column({
        type: 'boolean',
    })
    draw: boolean;
}
