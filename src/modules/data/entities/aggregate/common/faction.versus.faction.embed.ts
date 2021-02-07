/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';
import FactionVSVersusFactionEmbed from './factionvsfaction/FactionVSVersusFactionEmbed';
import FactionNCVersusFactionEmbed from './factionvsfaction/FactionNCVersusFactionEmbed';
import FactionTRVersusFactionEmbed from './factionvsfaction/FactionTRVersusFactionEmbed';
import FactionNSOVersusFactionEmbed from './factionvsfaction/FacitonNSOVersionFactionEmbed';

export default class FactionVersusFactionEmbed {
    // For some reason the examples aren't pulled out of embeds of embeds
    @ApiProperty({type: FactionVSVersusFactionEmbed, example: {nc: 123, tr: 123, nso: 123}, description: 'Kills made by VS against other factions'})
    @Column(() => FactionVSVersusFactionEmbed)
    vs: FactionVSVersusFactionEmbed;

    @ApiProperty({type: FactionNCVersusFactionEmbed, example: {vs: 123, tr: 123, nso: 123}, description: 'Kills made by NC against other factions'})
    @Column(() => FactionNCVersusFactionEmbed)
    nc: FactionNCVersusFactionEmbed;

    @ApiProperty({type: FactionTRVersusFactionEmbed, example: {vs: 123, nc: 123, nso: 123}, description: 'Kills made by TR against other factions'})
    @Column(() => FactionTRVersusFactionEmbed)
    tr: FactionTRVersusFactionEmbed;

    @ApiProperty({type: FactionNSOVersusFactionEmbed, example: {vs: 123, nc: 123, tr: 123}, description: 'Kills made by NSO against other factions'})
    @Column(() => FactionNSOVersusFactionEmbed)
    nso: FactionNSOVersusFactionEmbed;
}
