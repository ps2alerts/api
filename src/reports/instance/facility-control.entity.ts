import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";
import {Faction, factionArray} from '../../constants/faction';

@Entity()
@Index(["instance", "facility", "timestamp"], {unique: true})
export class FacilityControlEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
        nullable: false
    })
    instance: string;

    @Column({
        type: "number",
        nullable: false
    })
    facility: number;

    @Column({
        type: "date",
        nullable: false
    })
    timestamp: Date;

    @Column({
        type: "enum",
        enum: factionArray,
        nullable: false
    })
    oldFaction: Faction;

    @Column({
        type: "enum",
        enum: factionArray,
        nullable: false
    })
    newFaction: Faction;

    @Column({
        type: "number",
        default: 0
    })
    durationHeld: number;

    @Column({
        type: "boolean",
        nullable: false
    })
    isDefence: boolean;

    @Column({
        type: "string",
        nullable: true,
        default: null
    })
    outfitCaptured?: string;
}
