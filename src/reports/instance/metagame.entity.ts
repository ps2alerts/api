/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../constants/world.consts';
import {Zone, zoneArray} from '../../constants/zone.consts';
import {MetagameEventType, metagameEventTypeArray} from '../../constants/metagameevent.consts';
import {Ps2alertsEventState, ps2alertsEventStateArray} from '../../constants/eventstate.consts';

@Entity({
    name: 'instance_metagame',
})
@Index(['world', 'censusInstanceId'], {unique: true})
export default class Metagame {
    @ObjectIdColumn()
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: ObjectID;

    @Column({
        type: 'string',
    })
    instanceId: string;

    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @Column({
        type: 'date',
    })
    timeStarted: Date;

    @Column({
        type: 'date',
        nullable: true,
    })
    timeEnded?: Date;

    @Column({
        type: 'enum',
        enum: zoneArray,
    })
    zone: Zone;

    @Column({
        type: 'number',
    })
    censusInstanceId: number;

    @Column({
        type: 'enum',
        enum: metagameEventTypeArray,
    })
    censusMetagameEventType: MetagameEventType;

    @Column({
        type: 'number',
    })
    duration: number;

    @Column({
        type: 'enum',
        enum: ps2alertsEventStateArray,
    })
    state: Ps2alertsEventState;
}
