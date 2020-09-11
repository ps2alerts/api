import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";
import {Loadout, loadoutArray} from '../../constants/loadout';

@Entity()
@Index(["instance", "attacker", "character", "timestamp"], {unique: true})
export class DeathEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
        nullable: false
    })
    instance: string;

    @Column({
        type: "string",
        nullable: false
    })
    attacker: string;

    @Column({
        type: "string",
        nullable: false
    })
    character: string;

    @Column({
        type: "date",
        nullable: false
    })
    timestamp: Date;

    @Column({
        type: "number",
        nullable: false
    })
    attackerFiremode: number;

    @Column({
        type: "enum",
        enum: loadoutArray,
        nullable: false
    })
    attackerLoadout: Loadout;

    @Column({
        type: "number",
        nullable: false
    })
    weapon: number;

    @Column({
        type: "enum",
        enum: loadoutArray,
        nullable: false
    })
    characterLoadout: Loadout;

    @Column({
        type: "boolean",
        nullable: false
    })
    isHeadshot: boolean;

    @Column({
        type: "number",
        nullable: false
    })
    killType: number;

    @Column({
        type: "number",
        nullable: false
    })
    vehicle: number;
}
