/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';
import {Faction} from '../../../constants/faction.consts';
import {World} from '../../../constants/world.consts';
import OutfitEmbed from './outfit.embed';

export default class CharacterEmbed {
    @ApiProperty({example: '5428010618035323201', description: 'Character Census ID'})
    @Column({
        type: 'string',
    })
    id: string;

    @ApiProperty({example: 'Maelstrome26', description: 'Character name'})
    @Column({
        type: 'string',
    })
    name: string;

    @ApiProperty({example: 1, description: 'Character faction'})
    @Column({
        type: 'number',
    })
    faction: Faction;

    @ApiProperty({example: 10, description: 'Character world ID'})
    @Column({
        type: 'number',
    })
    world: World;

    @ApiProperty({example: 100, description: 'Character Battle Rank'})
    @Column({
        type: 'number',
    })
    battleRank: World;

    @ApiProperty({example: false, description: 'Character is ASPed'})
    @Column({
        type: 'boolean',
        default: false,
    })
    asp: boolean;

    @ApiProperty({type: OutfitEmbed, description: 'Character outfit information'})
    @Column(() => OutfitEmbed)
    outfit: OutfitEmbed | null;
}
