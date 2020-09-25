/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column} from 'typeorm';

export default class FacilityFactionControlEmbed {
    @Column({
        type: 'number',
        default: 0,
    })
    captures: number;

    @Column({
        type: 'number',
        default: 0,
    })
    defences: number;
}
