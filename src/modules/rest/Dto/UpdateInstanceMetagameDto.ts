import {IsDateString, IsNotEmpty, IsNumber, IsObject, IsString} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {Ps2alertsEventState} from '../../data/constants/eventstate.consts';
import Ps2AlertsInstanceResultInterface from '../../../interfaces/Ps2AlertsInstanceResultInterface';
import {Faction} from '../../data/constants/faction.consts';
import {Bracket} from '../../data/constants/bracket.consts';

export class UpdateInstanceMetagameDto {
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty({example: '10-12345'})
    instanceId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: Ps2alertsEventState.ENDED})
    state: Ps2alertsEventState;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: Bracket.PRIME})
    bracket: Bracket;

    @IsDateString()
    @IsNotEmpty()
    @ApiModelProperty({example: '2022-03-27T01:00:10.463Z'})
    timeEnded: Date;

    @IsObject()
    @IsNotEmpty()
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
