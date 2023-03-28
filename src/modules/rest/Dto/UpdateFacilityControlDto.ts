// @See modules/data/entities/instance/instance.facilitycontrol.entity.ts
import {Faction} from '../../data/ps2alerts-constants/faction';
import {IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import TerritoryControlMapControlEmbed from '../../data/entities/instance/territory.control.mapcontrol.embed';

export class UpdateFacilityControlDto {
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: Faction.NEW_CONGLOMERATE})
    oldFaction: Faction;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: Faction.VANU_SOVEREIGNTY})
    newFaction: Faction;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: 1234})
    durationHeld: number;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: false, default: false})
    isInitial: boolean;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: false})
    isDefence: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({example: '37509488620604880'})
    outfitCaptured?: string | null;

    @IsObject()
    @IsOptional()
    @ApiProperty({example: null, default: null})
    mapControl: TerritoryControlMapControlEmbed;
}
