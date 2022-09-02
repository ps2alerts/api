import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {IsNotEmpty} from 'class-validator';

export class UpdateRankingOutfitWarsDto {
    @IsNotEmpty()
    @ApiModelProperty({example: 'outfitwars-1-10-25939'})
    instanceId: string;
}
