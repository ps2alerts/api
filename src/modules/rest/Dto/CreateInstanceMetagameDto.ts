import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {World} from '../../data/constants/world.consts';
import {Zone} from '../../data/constants/zone.consts';
import {MetagameEventType} from '../../data/constants/metagameevent.consts';
import {Ps2alertsEventState} from '../../data/constants/eventstate.consts';
import {Ps2AlertsFeaturesInterface} from '../../../interfaces/Ps2AlertsFeaturesInterface';
import {Bracket} from '../../data/constants/bracket.consts';

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
    @ApiModelProperty({example: ''})
    timeStarted: string;

    @IsOptional()
    @ApiModelProperty({example: null, default: null})
    timeEnded: string; // Can't use null for some reason

    @IsOptional()
    @ApiModelProperty({example: null, default: null})
    result: string; // Can't use null for some reason

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
    @ApiModelProperty({example: Ps2alertsEventState.STARTED})
    state: Ps2alertsEventState;

    @IsNumber()
    @IsOptional()
    @ApiModelProperty({example: Bracket.UNKNOWN, default: Bracket.UNKNOWN})
    bracket: Bracket;

    @IsObject()
    @IsNotEmpty()
    @ApiModelProperty({example: {captureHistory: true}})
    features: Ps2AlertsFeaturesInterface;
}
