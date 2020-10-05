/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column} from 'typeorm';

export default class CombatStatsEmbed {
    @Column({
        type: 'number',
    })
    kills: number;

    @Column({
        type: 'number',
    })
    deaths: number;

    @Column({
        type: 'number',
    })
    teamKills: number;

    @Column({
        type: 'number',
    })
    suicides: number;

    @Column({
        type: 'number',
    })
    headshots: number;
}
