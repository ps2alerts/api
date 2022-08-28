/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import VehicleStatsEmbed from '../common/vehicle.vs.vehicle.embed';
import {Vehicle} from '../../../ps2alerts-constants/vehicle';
import {Ps2alertsEventType} from '../../../ps2alerts-constants/ps2alertsEventType';

@Entity({
    name: 'aggregate_instance_vehicles_characters',
})
@Index(['instance', 'vehicle', 'character', 'ps2AlertsEventType'], {unique: true})
@Index(['character'])
@Index(['ps2AlertsEventType'])
export default class InstanceVehicleCharacterAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({example: 1, description: 'Vehicle ID'})
    @Column({
        type: 'number',
    })
    vehicle: Vehicle;

    @ApiProperty({example: '5428010618035323201', description: 'Character ID'})
    @Column({
        type: 'string',
    })
    character: string;

    @ApiProperty({type: VehicleStatsEmbed, description: 'Combat Statistics for Vehicle vs Vehicle combat'})
    @Column(() => VehicleStatsEmbed)
    vehicles: VehicleStatsEmbed;

    @ApiProperty({type: VehicleStatsEmbed, description: 'Combat Statistics for Vehicle vs Infantry combat'})
    @Column(() => VehicleStatsEmbed)
    infantry: VehicleStatsEmbed;

    @ApiProperty({example: 123, description: 'Number of times a player has self destructed their vehicle (inside it or outside)'})
    @Column({
        type: 'number',
    })
    suicides: number;

    @ApiProperty({example: 123, description: 'Number of times a player has rammed / roadkilled someone with their vehicle'})
    @Column({
        type: 'number',
    })
    roadkills: number;

    @ApiProperty({example: {1: 123, 2: 123, 3: 123}, description: 'Counts of other vehicles this vehicle has killed'})
    @Column({
        type: 'json',
    })
    // eslint-disable-next-line @typescript-eslint/ban-types
    vehicleKillMatrix: object; // TODO: Fix this to be an object keyed via the Vehicle enum. Left it free for now.

    @ApiProperty({example: {1: 123, 2: 123, 3: 123}, description: 'Counts of other vehicles that have killed this vehicle'})
    @Column({
        type: 'json',
    })
    // eslint-disable-next-line @typescript-eslint/ban-types
    vehicleDeathMatrix: object; // TODO: Fix this to be an object keyed via the Vehicle enum. Left it free for now.

    @ApiProperty({example: {1: 123, 2: 123, 3: 123}, description: 'Counts of other vehicles this vehicle has teamkilled'})
    @Column({
        type: 'json',
    })
    // eslint-disable-next-line @typescript-eslint/ban-types
    vehicleTeamkillMatrix: object; // TODO: Fix this to be an object keyed via the Vehicle enum. Left it free for now.

    @ApiProperty({example: {1: 123, 2: 123, 3: 123}, description: 'Counts of other vehicles that have teamkilled this vehicle'})
    @Column({
        type: 'json',
    })
    // eslint-disable-next-line @typescript-eslint/ban-types
    vehicleTeamkilledMatrix: object; // TODO: Fix this to be an object keyed via the Vehicle enum. Left it free for now.

    @ApiProperty({
        example: Ps2alertsEventType.LIVE_METAGAME,
        description: 'PS2Alerts Event Type for the aggregate',
    })
    @Column({
        type: 'number',
        default: Ps2alertsEventType.LIVE_METAGAME,
    })
    ps2AlertsEventType: Ps2alertsEventType;
}
