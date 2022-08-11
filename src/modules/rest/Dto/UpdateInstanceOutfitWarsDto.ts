import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {Ps2alertsEventState} from '../../data/ps2alerts-constants/ps2alertsEventState';
import {Bracket} from '../../data/ps2alerts-constants/bracket';
import Ps2AlertsInstanceResultInterface from '../../../interfaces/Ps2AlertsInstanceResultInterface';
import { Faction } from '../../data/ps2alerts-constants/faction';

export class UpdateInstanceOutfitWarsDto {
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty({example: '10-12345'})
    instanceId: string;

    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: '2022-03-27T01:00:10.463Z'})
    timeEnded: Date;

    @IsObject()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({
        example: {
            vs: 0,
            nc: 44,
            tr: 55,
            cutoff: 0,
            outOfPlay: 0,
            victor: Faction.TERRAN_REPUBLIC,
            draw: false,
            perBasePercentage: 100/9,
        },
    })
    result: Ps2AlertsInstanceResultInterface;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: Ps2alertsEventState.ENDED})
    state: Ps2alertsEventState;

    @IsNumber()
    @IsOptional()
    @ApiModelProperty({example: Bracket.UNKNOWN, default: Bracket.UNKNOWN})
    bracket: Bracket;
}
