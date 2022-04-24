// @See modules/data/entities/instance/instance.facilitycontrol.entity.ts
import {Faction} from '../../data/constants/faction.consts';
import MapControlEmbed from '../../data/entities/instance/mapcontrol.embed.ts';
import {IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class CreateFacilityControlDto {
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty({example: '10-12345'})
    instance: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: 222280})
    facility: number;

    @IsDateString()
    @IsNotEmpty()
    @ApiModelProperty({example: '2022-03-27T01:00:10.463Z'})
    timestamp: Date;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: Faction.NEW_CONGLOMERATE})
    oldFaction: Faction;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: Faction.VANU_SOVEREIGNTY})
    newFaction: Faction;

    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty({example: 12345})
    durationHeld: number;

    @IsBoolean()
    @IsNotEmpty()
    @ApiModelProperty({example: false})
    isInitial: boolean;

    @IsString()
    @IsOptional()
    @ApiModelProperty({example: '37509488620604880'})
    outfitCaptured?: string | null;

    @IsObject()
    @IsOptional()
    mapControl: MapControlEmbed;
}
