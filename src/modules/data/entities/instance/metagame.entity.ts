/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../constants/world.consts';
import {Zone, zoneArray} from '../../constants/zone.consts';
import {MetagameEventType, metagameEventTypeArray} from '../../constants/metagameevent.consts';
import {Ps2alertsEventState, ps2alertsEventStateArray} from '../../constants/eventstate.consts';
import {ApiProperty} from '@nestjs/swagger';

@Entity({
    name: 'instance_metagame',
})
@Index(['world', 'censusInstanceId'], {unique: true})
export default class Metagame {
    @ObjectIdColumn()
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination to create a unique metagame instance ID that\'s human readable'})
    @Column({
        type: 'string',
    })
    instanceId: string;

    @ApiProperty({example: '10-12345', description: 'An ID as reported to us from Census. This in combination with world gives us a unique identifier.'})
    @Column({
        type: 'number',
    })
    censusInstanceId: number;

    @ApiProperty({example: 10, description: 'Server / World ID'})
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @ApiProperty({example: 2, description: 'Continent / Zone ID'})
    @Column({
        type: 'enum',
        enum: zoneArray,
    })
    zone: Zone;

    @ApiProperty({example: new Date(), description: 'Time the metagame instance started in UTC'})
    @Column({
        type: 'date',
    })
    timeStarted: Date;

    @ApiProperty({example: new Date(), description: 'Time the metagame instance ended in UTC'})
    @Column({
        type: 'date',
        nullable: true,
    })
    timeEnded?: Date;

    @ApiProperty({example: 147, description: 'The census metagame event type. This is what we use to determine what kind of alert this is (e.g. meltdown or not)'})
    @Column({
        type: 'enum',
        enum: metagameEventTypeArray,
    })
    censusMetagameEventType: MetagameEventType;

    @ApiProperty({example: 54000000, description: 'The expected duration of the metagame instance in miliseconds. This is usually either 1:30 or 0:45 hours.'})
    @Column({
        type: 'number',
    })
    duration: number;

    @ApiProperty({example: 2, description: 'The internal event state. 1 = in progress, 2 = finished'})
    @Column({
        type: 'enum',
        enum: ps2alertsEventStateArray,
    })
    state: Ps2alertsEventState;
}
