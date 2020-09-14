import {Column} from "typeorm";

export default class CombatStats{
    @Column({
        type: "number",
    })
    kills: number;

    @Column({
        type: "number",
    })
    deaths: number;

    @Column({
        type: "number",
    })
    teamKills: number;

    @Column({
        type: "number",
    })
    suicides: number;

    @Column({
        type: "number",
    })
    headshots: number;
}
