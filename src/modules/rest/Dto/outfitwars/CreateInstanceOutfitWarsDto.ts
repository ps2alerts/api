import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {World} from '../../../data/ps2alerts-constants/world';
import {Zone} from '../../../data/ps2alerts-constants/zone';
import {Ps2AlertsEventState} from '../../../data/ps2alerts-constants/ps2AlertsEventState';
import {Phase} from '../../../data/ps2alerts-constants/outfitwars/phase';
import {
    PS2AlertsInstanceFeaturesInterface,
} from '../../../data/ps2alerts-constants/interfaces/PS2AlertsInstanceFeaturesInterface';
import {
    OutfitwarsTerritoryResultInterface,
} from '../../../data/ps2alerts-constants/interfaces/OutfitwarsTerritoryResultInterface';
import {Ps2AlertsEventType} from '../../../data/ps2alerts-constants/ps2AlertsEventType';
import OutfitwarsMetadataEmbed from '../../../data/entities/instance/outfitwars.metadata.embed';

export class CreateInstanceOutfitWarsDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 'outfitwars-17-10-123'})
    instanceId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: World.EMERALD})
    world: World;

    @IsNumber()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiProperty({example: Zone.NEXUS})
    zone: Zone.NEXUS;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: 12})
    zoneInstanceId: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: 12345})
    censusInstanceId: number;

    @IsDateString()
    @IsNotEmpty()
    @ApiProperty({example: '2022-04-24T19:03:12.367Z'})
    timeStarted: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty({example: null, default: null})
    timeEnded: string | null;

    @IsObject()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({
        example: {
            blue: 55,
            red: 45,
            cutoff: 0,
            outOfPlay: 0,
            victor: null,
            perBasePercentage: 11.111111111111,
        },
    })
    result: OutfitwarsTerritoryResultInterface;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: 27000000, default: 27000000})
    duration: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({example: Ps2AlertsEventState.STARTED})
    state: Ps2AlertsEventState;

    @IsNumber()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiProperty({example: Ps2AlertsEventType.OUTFIT_WARS_AUG_2022})
    ps2AlertsEventType: Ps2AlertsEventType.OUTFIT_WARS_AUG_2022;

    @IsObject()
    @IsNotEmpty()
    @ApiProperty({example: {phase: Phase.QUALIFIERS, round: 3, teams: null}})
    outfitwars: OutfitwarsMetadataEmbed;

    @IsObject()
    @IsNotEmpty()
    @ApiProperty({example: {captureHistory: true, xpm: true}})
    features: PS2AlertsInstanceFeaturesInterface;

    @IsNotEmpty()
    @ApiProperty({example: '1.0'})
    mapVersion: string;
    //
    // @ApiProperty({description: 'Victory data for the match'})
    // @Column(() => OutfitWarsTeamsEmbed)
    // outfits: OutfitWarsTeamsEmbed;
}
