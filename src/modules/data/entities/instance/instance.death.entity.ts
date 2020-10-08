/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {Loadout, loadoutArray} from '../../constants/loadout.consts';

@Entity({
    name: 'instance_deaths',
})
@Index(['instance', 'attacker', 'character', 'timestamp'], {unique: true})

export default class InstanceDeathEntity {
    @ObjectIdColumn()
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: ObjectID;

    @Column({
        type: 'string',
    })
    instance: string;

    @Column({
        type: 'string',
    })
    attacker: string;

    @Column({
        type: 'string',
    })
    character: string;

    @Column({
        type: 'date',
    })
    timestamp: Date;

    @Column({
        type: 'number',
    })
    attackerFiremode: number;

    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    attackerLoadout: Loadout;

    @Column({
        type: 'number',
    })
    weapon: number;

    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    characterLoadout: Loadout;

    @Column({
        type: 'boolean',
    })
    isHeadshot: boolean;

    @Column({
        type: 'number',
    })
    killType: number;

    @Column({
        type: 'number',
        nullable: true,
    })
    vehicle?: number;
}
