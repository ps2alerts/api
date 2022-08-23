import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';
import {Phase, phaseArray} from '../../ps2alerts-constants/outfitwars/phase';
import OutfitWarsTeamsEmbed from '../aggregate/common/outfitwars.teams.embed';

export default class OutfitwarsMetadataEmbed {
    @ApiProperty({
        example: Phase.QUALIFIERS,
        enum: phaseArray,
        description: 'Phase of the event',
    })
    @Column({
        type: 'enum',
        enum: phaseArray,
    })
    phase: Phase;

    @ApiProperty({
        example: 2,
        description: 'Round count, this is incremental and is not directly linked to phase.',
    })
    @Column({
        type: 'number',
    })
    round: number;

    @ApiProperty({description: 'Information about the outfits in the match'})
    @Column(() => OutfitWarsTeamsEmbed)
    teams?: OutfitWarsTeamsEmbed;
}