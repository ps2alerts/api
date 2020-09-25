/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';

@Entity({
    name: 'aggregate_instance_outfits',
})
@Index(['instance', 'outfit'], {unique: true})
export default class InstanceOutfitAggregateEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: 'string',
    })
    instance: string;

    @Column({
        type: 'string',
    })
    outfit: string;

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
