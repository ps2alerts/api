/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {Column} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';
import OutfitEmbed from './outfit.embed';

export default class OutfitWarsTeamsEmbed {
    @ApiProperty({description: 'Red team outfit info'})
    @Column(() => OutfitEmbed)
    red: OutfitEmbed;

    @ApiProperty({description: 'Blue team outfit info'})
    @Column(() => OutfitEmbed)
    blue: OutfitEmbed;
}