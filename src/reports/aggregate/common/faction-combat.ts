import {Column} from "typeorm";

export class FactionCombat {
    @Column({
        type: "number",
        nullable: false
    })
    kills: number;

    @Column({
        type: "number",
        nullable: false
    })
    deaths: number;

    @Column({
        type: "number",
        nullable: false
    })
    teamKills: number;

    @Column({
        type: "number",
        nullable: false
    })
    suicides: number;

    @Column({
        type: "number",
        nullable: false
    })
    headshots: number;
}