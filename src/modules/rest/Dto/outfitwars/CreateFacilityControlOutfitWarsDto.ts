// @See modules/data/entities/instance/instance.facilitycontrol.entity.ts
import {IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import OutfitwarsMapControlEmbed from '../../../data/entities/instance/outfitwars.mapcontrol.embed';
import {Team} from '../../../data/ps2alerts-constants/outfitwars/team';

export class CreateFacilityControlOutfitWarsDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 'outfitwars-10-10-123'})
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
    @ApiProperty({example: Team.BLUE})
    oldFaction: Team;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: Team.RED})
    newFaction: Team;

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
    mapControl: OutfitwarsMapControlEmbed;
}
