/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {Loadout, loadoutArray} from '../../../constants/loadout.consts';
import {World, worldArray} from '../../../constants/world.consts';

@Entity({
    name: 'aggregate_global_class',
})
@Index(['class', 'world'], {unique: true})
export default class Class {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    class: Loadout; // Subject to change to a PlayerInterface

    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @Column({
        type: 'number',
        default: 0,
    })
    kills: number;

    @Column({
        type: 'number',
        default: 0,
    })
    deaths: number;

    @Column({
        type: 'number',
        default: 0,
    })
    teamKills: number;

    @Column({
        type: 'number',
        default: 0,
    })
    suicides: number;

    @Column({
        type: 'number',
        default: 0,
    })
    headshots: number;
}
