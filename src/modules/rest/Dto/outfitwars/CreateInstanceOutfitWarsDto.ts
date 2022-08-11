import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {World} from '../../../data/ps2alerts-constants/world';
import {Zone} from '../../../data/ps2alerts-constants/zone';
import {Ps2alertsEventState} from '../../../data/ps2alerts-constants/ps2alertsEventState';
import {Phase} from '../../../data/ps2alerts-constants/outfitwars/phase';
import {
    PS2AlertsInstanceFeaturesInterface,
} from '../../../data/ps2alerts-constants/interfaces/PS2AlertsInstanceFeaturesInterface';
import {
    OutfitwarsTerritoryResultInterface,
} from '../../../data/ps2alerts-constants/interfaces/OutfitwarsTerritoryResultInterface';
import {Ps2alertsEventType} from '../../../data/ps2alerts-constants/ps2alertsEventType';

export class CreateInstanceOutfitWarsDto {
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty({example: 'outfitwars-17-10-123'})
    instanceId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: World.EMERALD})
    world: World;

    @IsNumber()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiModelProperty({example: Zone.NEXUS})
    zone: Zone.NEXUS;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: 12})
    zoneInstanceId: number;

    @IsDateString()
    @IsNotEmpty()
    @ApiModelProperty({example: '2022-04-24T19:03:12.367Z'})
    timeStarted: string;

    @IsDateString()
    @IsOptional()
    @ApiModelProperty({example: null, default: null})
    timeEnded: string | null;

    @IsObject()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({
        example: {
            blue: 55,
            red: 45,
            cutoff: 0,
            outOfPlay: 0,
            victor: null,
            perBasePercentage: 11.111111111111,
        },
    })
    result: OutfitwarsTerritoryResultInterface;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: 27000000, default: 27000000})
    duration: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: Ps2alertsEventState.STARTED})
    state: Ps2alertsEventState;

    @IsNumber()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiModelProperty({example: Ps2alertsEventType.OUTFIT_WARS_AUG_2022})
    ps2alertsEventType: Ps2alertsEventType.OUTFIT_WARS_AUG_2022;

    @IsNumber()
    @IsOptional()
    @ApiModelProperty({example: Phase.QUALIFIERS})
    phase: Phase;

    @IsNotEmpty()
    @ApiModelProperty({example: '2'})
    round: number;

    @IsObject()
    @IsNotEmpty()
    @ApiModelProperty({example: {captureHistory: true, xpm: true}})
    features: PS2AlertsInstanceFeaturesInterface;

    @IsNotEmpty()
    @ApiModelProperty({example: '1.0'})
    mapVersion: string;
}
