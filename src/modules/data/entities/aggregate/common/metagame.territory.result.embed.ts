/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column} from 'typeorm';
import {Faction, factionArray} from '../../../ps2alerts-constants/faction';
import {ApiProperty} from '@nestjs/swagger';

export default class MetagameTerritoryResultEmbed {
    @ApiProperty({example: 34, description: 'VS capture percentage'})
    @Column({
        type: 'number',
    })
    vs: number;

    @ApiProperty({example: 33, description: 'NC capture percentage'})
    @Column({
        type: 'number',
    })
    nc: number;

    @ApiProperty({example: 33, description: 'TR capture percentage'})
    @Column({
        type: 'number',
    })
    tr: number;

    @ApiProperty({example: 0, description: 'Percentage of bases cut off from warpgates (which don\'t contribute to faction score)'})
    @Column({
        type: 'number',
    })
    cutoff: number;

    @ApiProperty({example: 0, description: 'Percentage of bases out of play and not cannot be captured (e.g. for underpowered alerts)'})
    @Column({
        type: 'number',
    })
    outOfPlay: number;

    @ApiProperty({example: Faction.VANU_SOVEREIGNTY, enum: factionArray, description: 'victor of the instance. 1 = VS, 2 = NC, 3 = TR'})
    @Column({
        type: 'number',
        enum: factionArray,
    })
    victor: Faction;

    @ApiProperty({example: false, description: 'If instance was a draw or not. In-game this won\'t be a draw (technically), but we represent it as one in the meta.'})
    @Column({
        type: 'boolean',
    })
    draw: boolean;

    @ApiProperty({example: false, description: 'Per base capture worth in percentage'})
    @Column({
        type: 'decimal',
        precision: 2,
        scale: 2,
    })
    perBasePercentage: number;
}
