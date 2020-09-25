/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {Loadout, loadoutArray} from '../../../constants/loadout.consts';

@Entity({
    name: 'aggregate_instance_class',
})
@Index(['instance', 'class'], {unique: true})
export default class InstanceClassAggregateEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: 'string',
    })
    instance: string;

    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    class: Loadout; // Subject to change to a PlayerInterface

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
