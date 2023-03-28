import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {World} from '../../data/ps2alerts-constants/world';
import {Zone} from '../../data/ps2alerts-constants/zone';
import {MetagameEventType} from '../../data/ps2alerts-constants/metagameEventType';
import {Ps2AlertsEventState} from '../../data/ps2alerts-constants/ps2AlertsEventState';
import {Bracket} from '../../data/ps2alerts-constants/bracket';
import {
    MetagameTerritoryControlResultInterface,
} from '../../data/ps2alerts-constants/interfaces/MetagameTerritoryControlResultInterface';
import {
    PS2AlertsInstanceFeaturesInterface,
} from '../../data/ps2alerts-constants/interfaces/PS2AlertsInstanceFeaturesInterface';
import {Ps2AlertsEventType} from '../../data/ps2alerts-constants/ps2AlertsEventType';

export class CreateInstanceMetagameDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: '10-12345'})
    instanceId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: World.MILLER})
    world: World;

    @IsDateString()
    @IsNotEmpty()
    @ApiProperty({example: '2022-04-24T19:03:12.367Z'})
    timeStarted: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty({
        example: null,
        default: null,
    })
    timeEnded: string | null; // Can't use null for some reason

    @IsObject()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({
        example: {
            vs: 30,
            nc: 27,
            tr: 40,
            cutoff: 1,
            outOfPlay: 0,
            victor: null,
            draw: false,
            perBasePercentage: 1.1627906976744187,
        },
    })
    result: MetagameTerritoryControlResultInterface;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: Zone.INDAR})
    zone: Zone;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: 12345})
    censusInstanceId: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: MetagameEventType.AMERISH_ENLIGHTENMENT})
    censusMetagameEventType: MetagameEventType;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: 1800})
    duration: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: Ps2AlertsEventState.STARTED})
    state: Ps2AlertsEventState;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: Ps2AlertsEventType.LIVE_METAGAME,
        default: Ps2AlertsEventType.LIVE_METAGAME,
    })
    ps2AlertsEventType: Ps2AlertsEventType;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: Bracket.UNKNOWN,
        default: Bracket.UNKNOWN,
    })
    bracket: Bracket;

    @IsObject()
    @IsNotEmpty()
    @ApiProperty({example: {captureHistory: true, xpm: true}})
    features: PS2AlertsInstanceFeaturesInterface;

    @IsNotEmpty()
    @ApiProperty({example: '1.0'})
    mapVersion: string;

    @IsNotEmpty()
    @ApiProperty({example: '1.0'})
    latticeVersion: string;
}
