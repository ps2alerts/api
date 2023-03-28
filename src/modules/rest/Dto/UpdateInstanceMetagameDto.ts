import {IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {Ps2AlertsEventState} from '../../data/ps2alerts-constants/ps2AlertsEventState';
import {Faction} from '../../data/ps2alerts-constants/faction';
import {Bracket} from '../../data/ps2alerts-constants/bracket';
import {
    MetagameTerritoryControlResultInterface,
} from '../../data/ps2alerts-constants/interfaces/MetagameTerritoryControlResultInterface';

export class UpdateInstanceMetagameDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: '10-12345'})
    instanceId: string;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: Ps2AlertsEventState.ENDED})
    state: Ps2AlertsEventState;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: Bracket.PRIME})
    bracket: Bracket;

    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({example: '2022-03-27T01:00:10.463Z'})
    timeEnded: Date;

    @IsObject()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({
        example: {
            vs: 30,
            nc: 27,
            tr: 40,
            cutoff: 1,
            outOfPlay: 0,
            victor: Faction.TERRAN_REPUBLIC,
            draw: true,
            perBasePercentage: 1.1627906976744187,
        },
    })
    result: MetagameTerritoryControlResultInterface;
}
