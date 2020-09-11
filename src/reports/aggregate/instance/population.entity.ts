import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";

@Entity()
@Index(["instance", "timestamp"], {unique: true})
export class PopulationEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
        nullable: false
    })
    instance: string;

    @Column({
        type: "date",
        nullable: false
    })
    timestamp: Date;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    vs: number;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    nc: number;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    tr: number;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    nso: number;

    @Column({
        type: "number",
        default: 0,
        nullable: false
    })
    total: number;
}
