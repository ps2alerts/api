// @See modules/data/entities/instance/instance.facilitycontrol.entity.ts
import {IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {Team} from '../../../data/ps2alerts-constants/outfitwars/team';
import OutfitwarsMapControlEmbed from '../../../data/entities/instance/outfitwars.mapcontrol.embed';

export class UpdateFacilityControlOutfitWarsDto {
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: Team.BLUE})
    oldFaction: Team;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: Team.RED})
    newFaction: Team;

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
    mapControl: OutfitwarsMapControlEmbed;
}
