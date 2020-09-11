import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";

@Entity()
@Index(["instance", "world"], {unique: true})
export class CharacterEntity {
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
    character: string;

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

    @Column({
        type: "string",
        nullable: true
    })
    outfit?: string;
}
