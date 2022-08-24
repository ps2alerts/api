/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';
import {Faction} from '../../../ps2alerts-constants/faction';
import {World} from '../../../ps2alerts-constants/world';
import {OutfitwarsOutfitDataInterface} from '../../../ps2alerts-constants/interfaces/OutfitwarsRankingInterface';

export default class OutfitEmbed implements OutfitwarsOutfitDataInterface {
    @ApiProperty({example: '37509488620604883', description: 'Census outfit ID'})
    @Column({
        type: 'string',
    })
    id: string;

    @ApiProperty({example: 'Dignity of War', description: 'Outfit Name'})
    @Column({
        type: 'string',
    })
    name: string;

    @ApiProperty({example: 1, description: 'Outfit faction ID'})
    @Column({
        type: 'number',
    })
    faction: Faction;

    @ApiProperty({example: 10, description: 'Outfit world ID'})
    @Column({
        type: 'number',
    })
    world: World;

    @ApiProperty({example: '8276172967445322465', description: 'Census Character ID of Leader'})
    @Column({
        type: 'string',
    })
    leader: string;

    @ApiProperty({example: 'DIG', description: 'Outfit Tag'})
    @Column({
        type: 'string',
    })
    tag: string | null;
}
