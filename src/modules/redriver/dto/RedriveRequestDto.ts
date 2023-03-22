import {ApiProperty} from '@nestjs/swagger';
import {IsDateString, IsEnum, IsNotEmpty} from 'class-validator';
import {World} from '../../data/ps2alerts-constants/world';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {RedriveStatus} from '../../data/entities/redrive/redrive.request.entity';

export class RedriveRequestDto {
    @ApiProperty({example: World.MILLER, description: 'World to perform the redrives upon'})
    @IsEnum(World)
    @IsNotEmpty()
    world: World;

    @IsDateString()
    @IsNotEmpty()
    @ApiModelProperty({example: '2019-11-01T00:00:00.000Z', description: 'Start date of the redrive'})
    dateStart: Date;

    @IsDateString()
    @IsNotEmpty()
    @ApiModelProperty({example: '2019-11-05T00:00:00.000Z', description: 'End date of the redrive'})
    dateEnd: Date;

    @IsEnum(RedriveStatus)
    status: RedriveStatus;

    constructor() {
        this.status = RedriveStatus.PENDING;
    }
}
