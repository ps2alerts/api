import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";
import {World, worldArray} from '../../../constants/world';

@Entity()
@Index(["character", "world"], {unique: true})
export class CharacterEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
        nullable: false
    })
    character: string;

    @Column({
        type: "enum",
        enum: worldArray,
        nullable: false
    })
    world: World;

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
