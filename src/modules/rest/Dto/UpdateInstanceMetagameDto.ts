import {IsDateString, IsNotEmpty, IsNumber, IsString} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {Ps2alertsEventState} from '../../data/constants/eventstate.consts';

export class UpdateInstanceMetagameDto {
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty({example: '10-12345'})
    instanceId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: Ps2alertsEventState.ENDED})
    state: Ps2alertsEventState;

    @IsDateString()
    @IsNotEmpty()
    @ApiModelProperty({example: '2022-03-27T01:00:10.463Z'})
    timeEnded: Date;
}
