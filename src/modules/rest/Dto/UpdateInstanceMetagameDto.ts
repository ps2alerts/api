import {IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {Ps2alertsEventState} from '../../data/constants/eventstate.consts';
import Ps2AlertsInstanceResultInterface from '../../../interfaces/Ps2AlertsInstanceResultInterface';
import {Faction} from '../../data/constants/faction.consts';
import {Bracket} from '../../data/constants/bracket.consts';

export class UpdateInstanceMetagameDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: '10-12345'})
    instanceId: string;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: Ps2alertsEventState.ENDED})
    state: Ps2alertsEventState;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: Bracket.PRIME})
    bracket: Bracket;

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
            vs: 30,
            nc: 27,
            tr: 40,
            cutoff: 1,
            outOfPlay: 0,
            victor: Faction.TERRAN_REPUBLIC,
            draw: true,
        },
    })
    result: Ps2AlertsInstanceResultInterface;
}
