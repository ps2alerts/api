import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";

@Entity()
@Index(["instance", "outfit"], {unique: true})
export class OutfitEntity {
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
    outfit: string;

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
