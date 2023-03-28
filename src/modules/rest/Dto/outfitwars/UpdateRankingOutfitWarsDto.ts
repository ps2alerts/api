import {ApiProperty} from '@nestjs/swagger';
import {IsOptional} from 'class-validator';

export class UpdateRankingOutfitWarsDto {
    @IsOptional()
    @ApiProperty({example: 'outfitwars-1-10-25939', required: false})
    instanceId?: string | undefined;

    @IsOptional()
    @ApiProperty({
        example: 1,
        description: 'If fudging is needed due to bugs with data retrieval (Cobalt), updates the wins of a ranking for an outfit. If legitimate data exists in Falcon\'s API, it will overwrite this fudged data.',
        required: false,
    })
    wins?: number | undefined;

    @IsOptional()
    @ApiProperty({
        example: 0,
        description: 'Updates the losses of a ranking for an outfit.',
        required: false,
    })
    losses?: number | undefined;

    @IsOptional()
    @ApiProperty({
        example: 420,
        description: 'Updates the tiebreaker points of a ranking for an outfit.',
        required: false,
    })
    tiebreakerPoints?: number | undefined;
}
