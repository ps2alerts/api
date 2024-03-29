/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectId} from 'typeorm';
import CharacterEmbed from '../common/character.embed';
import FactionVersusFactionEmbed from '../common/faction.versus.faction.embed';
import XperminuteEmbed from '../common/xperminute.embed';
import {Ps2AlertsEventType} from '../../../ps2alerts-constants/ps2AlertsEventType';

@Entity({
    name: 'aggregate_instance_characters',
})
@Index(['instance', 'character.id', 'ps2AlertsEventType'], {unique: true})
@Index(['character.id'])
@Index(['ps2AlertsEventType'])
export default class InstanceCharacterAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    @ApiHideProperty()
    _id: ObjectId;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({type: CharacterEmbed, description: 'Character details'})
    @Column(() => CharacterEmbed)
    character: CharacterEmbed;

    @ApiProperty({example: 22, description: 'Total number of kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    kills: number;

    @ApiProperty({example: 18, description: 'Total number of deaths'})
    @Column({
        type: 'number',
        default: 0,
    })
    deaths: number;

    @ApiProperty({example: 3, description: 'Total number of team kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    teamKills: number;

    @ApiProperty({example: 5, description: 'Total number of times teamkilled'})
    @Column({
        type: 'number',
        default: 0,
    })
    teamKilled: number;

    @ApiProperty({example: 2, description: 'Total number of suicides'})
    @Column({
        type: 'number',
        default: 0,
    })
    suicides: number;

    @ApiProperty({example: 15, description: 'Total number of headshots'})
    @Column({
        type: 'number',
        default: 0,
    })
    headshots: number;

    @ApiProperty({type: FactionVersusFactionEmbed, description: 'Kills broken down by faction'})
    @Column(() => FactionVersusFactionEmbed)
    factionKills: FactionVersusFactionEmbed;

    @ApiProperty({example: 1654033928, description: 'Second that the character was first seen relative to alert start'})
    @Column({
        type: 'number',
        default: 0,
    })
    durationFirstSeen: number;

    @ApiProperty({example: 1654033928, description: 'Length character was seen in alert as of the first death / kill'})
    @Column({
        type: 'number',
        default: 0,
    })
    durationInAlert: number;

    @ApiProperty({type: XperminuteEmbed, description: 'Statistics per minute for character relative to duration in alert'})
    @Column(() => XperminuteEmbed)
    xPerMinutes: XperminuteEmbed;

    @ApiProperty({
        example: Ps2AlertsEventType.LIVE_METAGAME,
        description: 'PS2Alerts Event Type for the aggregate',
    })
    @Column({
        type: 'number',
        default: Ps2AlertsEventType.LIVE_METAGAME,
    })
    ps2AlertsEventType: Ps2AlertsEventType;
}
