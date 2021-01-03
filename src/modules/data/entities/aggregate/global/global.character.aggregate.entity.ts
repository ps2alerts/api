/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../../constants/world.consts';
import CharacterEmbed from '../common/character.embed';
import {Bracket, bracketArray} from '../../../constants/bracket.consts';

@Entity({
    name: 'aggregate_global_characters',
})
@Index(['world', 'bracket', 'character.id'], {unique: true})
@Index(['character.id'])
export default class GlobalCharacterAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({enum: worldArray, example: 10, description: 'Server / World ID'})
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @ApiProperty({example: Bracket.PRIME, enum: bracketArray, description: 'Activity bracket level of the Aggregate'})
    @Column({
        type: 'enum',
        enum: bracketArray,
    })
    bracket: Bracket;

    @ApiProperty({type: CharacterEmbed, description: 'Character details'})
    @Column(() => CharacterEmbed)
    character: CharacterEmbed;

    @ApiProperty({example: 22, description: 'Total number of kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    kills: number;

    @ApiProperty({example: 18, description: 'Total number of deaths'})
    @Column({
        type: 'number',
        default: 0,
    })
    deaths: number;

    @ApiProperty({example: 3, description: 'Total number of team kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    teamKills: number;

    @ApiProperty({example: 2, description: 'Total number of suicides'})
    @Column({
        type: 'number',
        default: 0,
    })
    suicides: number;

    @ApiProperty({example: 15, description: 'Total number of headshots'})
    @Column({
        type: 'number',
        default: 0,
    })
    headshots: number;
}
