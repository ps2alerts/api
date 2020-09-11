import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";
import {Loadout, loadoutArray} from '../../../constants/loadout';

@Entity()
@Index(["instance", "class"], {unique: true})
export class ClassEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
        nullable: false
    })
    instance: string;

    @Column({
        type: "enum",
        enum: loadoutArray,
        nullable: false
    })
    class: Loadout; // Subject to change to a PlayerInterface

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    kills: number;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    deaths: number;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    teamKills: number;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    suicides: number;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    headshots: number;
}
