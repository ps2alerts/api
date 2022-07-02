// @See modules/data/entities/instance/instance.facilitycontrol.entity.ts
import {Faction} from '../../data/ps2alerts-constants/faction';
import MapControlEmbed from '../../data/entities/instance/mapcontrol.embed.ts';
import {IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class UpdateFacilityControlDto {
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: Faction.NEW_CONGLOMERATE})
    oldFaction: Faction;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: Faction.VANU_SOVEREIGNTY})
    newFaction: Faction;

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
    mapControl: MapControlEmbed;
}
