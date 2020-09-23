/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {Faction, factionArray} from '../../constants/faction.consts';

@Entity({
    name: 'instance_facilitycontrol',
})
@Index(['instance', 'facility', 'timestamp'], {unique: true})
export default class FacilityControl {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: 'string',
    })
    instance: string;

    @Column({
        type: 'number',
    })
    facility: number;

    @Column({
        type: 'date',
    })
    timestamp: Date;

    @Column({
        type: 'enum',
        enum: factionArray,
    })
    oldFaction: Faction;

    @Column({
        type: 'enum',
        enum: factionArray,
    })
    newFaction: Faction;

    @Column({
        type: 'number',
        default: 0,
    })
    durationHeld: number;

    @Column({
        type: 'boolean',
    })
    isDefence: boolean;

    @Column({
        type: 'string',
        nullable: true,
        default: null,
    })
    outfitCaptured?: string;
}
