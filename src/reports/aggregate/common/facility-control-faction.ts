import {Column} from "typeorm";

export class FacilityControlFaction {
    @Column({
        type: "number",
        default: 0
    })
    captures: number;

    @Column({
        type: "number",
        default: 0
    })
    defences: number;
}
