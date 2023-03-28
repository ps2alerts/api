// @See modules/data/entities/instance/instance.facilitycontrol.entity.ts
import {Faction} from '../../data/ps2alerts-constants/faction';
import {IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import TerritoryControlMapControlEmbed from '../../data/entities/instance/territory.control.mapcontrol.embed';
import {ApiProperty} from '@nestjs/swagger';

export class CreateFacilityControlDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: '10-12345'})
    instance: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: 222280})
    facility: number;

    @IsDateString()
    @IsNotEmpty()
    @ApiProperty({example: '2022-03-27T01:00:10.463Z'})
    timestamp: Date;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: Faction.NEW_CONGLOMERATE})
    oldFaction: Faction;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: Faction.VANU_SOVEREIGNTY})
    newFaction: Faction;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: 1234})
    durationHeld: number;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: false, default: false})
    isInitial: boolean;

    @IsBoolean()
    @IsNotEmpty()
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
