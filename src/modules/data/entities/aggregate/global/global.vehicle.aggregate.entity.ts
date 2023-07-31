/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import VehicleStatsEmbed from '../common/vehicle.vs.vehicle.embed';
import {World, worldArray} from '../../../ps2alerts-constants/world';
import {Vehicle, vehicleArray} from '../../../ps2alerts-constants/vehicle';
import {Bracket, ps2alertsBracketArray} from '../../../ps2alerts-constants/bracket';
import {Ps2AlertsEventType} from '../../../ps2alerts-constants/ps2AlertsEventType';

@Entity({
    name: 'aggregate_global_vehicles',
})
@Index(['world', 'vehicle', 'bracket', 'ps2AlertsEventType'], {unique: true})
@Index(['vehicle'])
@Index(['ps2AlertsEventType'])
export default class GlobalVehicleAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    @ApiHideProperty()
    _id: ObjectID;

    @ApiProperty({example: Vehicle.FLASH, enum: vehicleArray, description: 'Vehicle ID'})
    @Column({
        type: 'number',
    })
    vehicle: Vehicle;

    @ApiProperty({example: Bracket.PRIME, enum: ps2alertsBracketArray, description: 'Activity bracket level of the Aggregate'})
    @Column({
        type: 'enum',
        enum: ps2alertsBracketArray,
    })
    bracket: Bracket;

    @ApiProperty({example: World.MILLER, enum: worldArray, description: 'World ID'})
    @Column({
        type: 'number',
    })
    world: World;

    @ApiProperty({type: VehicleStatsEmbed, description: 'Combat Statistics for Vehicle vs Vehicle combat'})
    @Column(() => VehicleStatsEmbed)
    vehicles: VehicleStatsEmbed;

    @ApiProperty({type: VehicleStatsEmbed, description: 'Combat Statistics for Vehicle vs Infantry combat'})
    @Column(() => VehicleStatsEmbed)
    infantry: VehicleStatsEmbed;

    @ApiProperty({example: 12, description: 'Number of times a player has self destructed their vehicle (inside it or outside)'})
    @Column({
        type: 'number',
    })
    suicides: number;

    @ApiProperty({example: 123, description: 'Number of times a player has rammed / roadkilled someone with their vehicle'})
    @Column({
        type: 'number',
    })
    roadkills: number;

    @ApiProperty({example: {1: 12, 2: 21, 3: 4}, description: 'Counts of other vehicles this vehicle has killed'})
    @Column({
        type: 'json',
    })
    // eslint-disable-next-line @typescript-eslint/ban-types
    vehicleKillMatrix: object; // TODO: Fix this to be an object keyed via the Vehicle enum. Left it free for now.

    @ApiProperty({example: {1: 12, 2: 21, 3: 4}, description: 'Counts of other vehicles that have killed this vehicle'})
    @Column({
        type: 'json',
    })
    // eslint-disable-next-line @typescript-eslint/ban-types
    vehicleDeathMatrix: object; // TODO: Fix this to be an object keyed via the Vehicle enum. Left it free for now.

    @ApiProperty({example: {1: 12, 2: 21, 3: 4}, description: 'Counts of other vehicles this vehicle has teamkilled'})
    @Column({
        type: 'json',
    })
    // eslint-disable-next-line @typescript-eslint/ban-types
    vehicleTeamkillMatrix: object; // TODO: Fix this to be an object keyed via the Vehicle enum. Left it free for now.

    @ApiProperty({example: {1: 12, 2: 21, 3: 4}, description: 'Counts of other vehicles that have teamkilled this vehicle'})
    @Column({
        type: 'json',
    })
    // eslint-disable-next-line @typescript-eslint/ban-types
    vehicleTeamkilledMatrix: object; // TODO: Fix this to be an object keyed via the Vehicle enum. Left it free for now.

    @ApiProperty({
        example: Ps2AlertsEventType.LIVE_METAGAME,
        description: 'PS2Alerts Event Type for the aggregate',
    })
    @Column({
        type: 'number',
        default: Ps2AlertsEventType.LIVE_METAGAME,
    })
    ps2AlertsEventType: Ps2AlertsEventType;
}
