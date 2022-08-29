import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
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
    @ApiModelProperty({example: '10-12345'})
    instanceId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: World.MILLER})
    world: World;

    @IsDateString()
    @IsNotEmpty()
    @ApiModelProperty({example: '2022-04-24T19:03:12.367Z'})
    timeStarted: string;

    @IsDateString()
    @IsOptional()
    @ApiModelProperty({
        example: null,
        default: null,
    })
    timeEnded: string | null; // Can't use null for some reason

    @IsObject()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({
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
    @ApiModelProperty({example: Zone.INDAR})
    zone: Zone;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: 12345})
    censusInstanceId: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: MetagameEventType.AMERISH_ENLIGHTENMENT})
    censusMetagameEventType: MetagameEventType;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: 1800})
    duration: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: Ps2AlertsEventState.STARTED})
    state: Ps2AlertsEventState;

    @IsNumber()
    @IsOptional()
    @ApiModelProperty({
        example: Ps2AlertsEventType.LIVE_METAGAME,
        default: Ps2AlertsEventType.LIVE_METAGAME,
    })
    ps2AlertsEventType: Ps2AlertsEventType;

    @IsNumber()
    @IsOptional()
    @ApiModelProperty({
        example: Bracket.UNKNOWN,
        default: Bracket.UNKNOWN,
    })
    bracket: Bracket;

    @IsObject()
    @IsNotEmpty()
    @ApiModelProperty({example: {captureHistory: true, xpm: true}})
    features: PS2AlertsInstanceFeaturesInterface;

    @IsNotEmpty()
    @ApiModelProperty({example: '1.0'})
    mapVersion: string;
}
