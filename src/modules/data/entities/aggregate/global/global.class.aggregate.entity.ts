/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Loadout, loadoutArray} from '../../../constants/loadout.consts';
import {World, worldArray} from '../../../constants/world.consts';

@Entity({
    name: 'aggregate_global_classes',
})
@Index(['class', 'world'], {unique: true})
export default class GlobalClassAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({enum: loadoutArray, description: 'Class / Loadout ID'})
    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    class: Loadout; // Subject to change to a PlayerInterface

    @ApiProperty({enum: worldArray, description: 'Server / World ID'})
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

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
