import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {Ps2alertsEventState} from '../../../data/ps2alerts-constants/ps2alertsEventState';
import {
    OutfitwarsTerritoryResultInterface,
} from '../../../data/ps2alerts-constants/interfaces/OutfitwarsTerritoryResultInterface';
import {Team} from '../../../data/ps2alerts-constants/outfitwars/team';
import OutfitwarsMetadataEmbed from '../../../data/entities/instance/outfitwars.metadata.embed';

export class UpdateInstanceOutfitWarsDto {
    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: '2022-03-27T01:00:10.463Z'})
    timeEnded: Date;

    @IsObject()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({
        example: {
            blue: 55,
            red: 45,
            cutoff: 0,
            outOfPlay: 0,
            victor: Team.BLUE,
            perBasePercentage: 100 / 9,
        },
    })
    result: OutfitwarsTerritoryResultInterface;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({example: Ps2alertsEventState.ENDED})
    state: Ps2alertsEventState;

    @IsObject()
    @IsNotEmpty()
    @IsOptional()
    @ApiModelProperty({
        example: {
            teams: {
                blue: {
                    id: '37509488620604883'
                },
                red: {
                    id: '37570391403474491'
                }
            }
        }
    })
    outfitwars: OutfitwarsMetadataEmbed;
}
