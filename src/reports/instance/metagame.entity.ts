import {Column, ObjectIdColumn, Entity, Index, ObjectID} from "typeorm";
import {World, worldArray} from '../../constants/world';
import {Zone, zoneArray} from '../../constants/zone';
import {MetagameEventType, metagameEventTypeArray} from '../../constants/metagameEventType';
import {Ps2alertsEventState, ps2alertsEventStateArray} from '../../constants/ps2alertsEventState';

@Entity()
@Index(["world", "censusInstanceId"], {unique: true})
export class MetagameEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({
        type: "string",
        nullable: false
    })
    instanceId: string;

    @Column({
        type: "enum",
        enum: worldArray,
        nullable: false
    })
    world: World;

    @Column({
        type: "date",
        nullable: false
    })
    timeStarted: Date;

    @Column({
        type: "date",
        nullable: true
    })
    timeEnded?: Date;

    @Column({
        type: "enum",
        enum: zoneArray,
        nullable: false
    })
    zone: Zone;

    @Column({
        type: "number",
        nullable: false
    })
    censusInstanceId: number;

    @Column({
        type: "enum",
        enum: metagameEventTypeArray,
        nullable: false
    })
    censusMetagameEventType: MetagameEventType;

    @Column({
        type: "number",
        nullable: false
    })
    duration: number;

    @Column({
        type: "enum",
        enum: ps2alertsEventStateArray,
        nullable: false
    })
    state: Ps2alertsEventState;
}
