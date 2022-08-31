// @See modules/data/entities/instance/instance.facilitycontrol.entity.ts
import {IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {Team} from '../../../data/ps2alerts-constants/outfitwars/team';
import OutfitwarsMapControlEmbed from '../../../data/entities/instance/outfitwars.mapcontrol.embed';

export class UpdateFacilityControlOutfitWarsDto {
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: Team.BLUE})
    oldFaction: Team;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: Team.RED})
    newFaction: Team;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: 1234})
    durationHeld: number;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: false, default: false})
    isInitial: boolean;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: false})
    isDefence: boolean;

    @IsString()
    @IsOptional()
    @ApiModelProperty({example: '37509488620604880'})
    outfitCaptured?: string | null;

    @IsObject()
    @IsOptional()
    @ApiModelProperty({example: null, default: null})
    mapControl: OutfitwarsMapControlEmbed;
}
