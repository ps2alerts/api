/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {World, worldArray} from '../../../ps2alerts-constants/world';
import ItemEmbed from '../common/item.embed';
import {Bracket, ps2alertsBracketArray} from '../../../ps2alerts-constants/bracket';
import FactionVersusFactionEmbed from '../common/faction.versus.faction.embed';
import {Ps2AlertsEventType} from '../../../ps2alerts-constants/ps2AlertsEventType';

@Entity({
    name: 'aggregate_global_weapons',
})
@Index(['world', 'weapon.id', 'bracket', 'ps2AlertsEventType'], {unique: true})
@Index(['weapon.id'])
@Index(['bracket'])
@Index(['kills'])
@Index(['teamKills'])
@Index(['suicides'])
@Index(['headshots'])
@Index(['ps2AlertsEventType'])
export default class GlobalWeaponAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    @ApiHideProperty()
    _id: ObjectID;

    @ApiProperty({enum: worldArray, example: 10, description: 'Server / World ID'})
    @Column({
        type: 'enum',
        enum: worldArray,
    })
    world: World;

    @ApiProperty({example: Bracket.PRIME, enum: ps2alertsBracketArray, description: 'Activity bracket level of the Aggregate'})
    @Column({
        type: 'enum',
        enum: ps2alertsBracketArray,
    })
    bracket: Bracket;

    @ApiProperty({type: ItemEmbed, description: 'Weapon'})
    @Column(() => ItemEmbed)
    weapon: ItemEmbed;

    @ApiProperty({example: 22, description: 'Total number of kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    kills: number;

    @ApiProperty({example: 3, description: 'Total number of team kills'})
    @Column({
        type: 'number',
        default: 0,
    })
    teamKills: number;

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
