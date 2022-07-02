/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';
import {Loadout, loadoutArray} from '../../ps2alerts-constants/loadout';
import CharacterEmbed from '../aggregate/common/character.embed';

@Entity({
    name: 'instance_deaths',
})
@Index(['instance', 'attacker.id', 'character.id', 'timestamp'], {unique: true})

export default class InstanceDeathEntity {
    @ObjectIdColumn()
    @Exclude()
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({type: CharacterEmbed, description: 'Attacker Character details'})
    @Column(() => CharacterEmbed)
    attacker: CharacterEmbed;

    @ApiProperty({type: CharacterEmbed, description: 'Character details'})
    @Column(() => CharacterEmbed)
    character: CharacterEmbed;

    @ApiProperty({example: new Date(), description: 'Time of event instance in UTC'})
    @Column({
        type: 'date',
    })
    timestamp: Date;

    @ApiProperty({example: 410, description: 'Firemode of weapon used to kill character'})
    @Column({
        type: 'number',
    })
    attackerFiremode: number;

    @ApiProperty({enum: loadoutArray, description: 'Loadout of attacker character'})
    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    attackerLoadout: Loadout;

    @ApiProperty({example: 3104, description: 'Weapon used to kill the character'})
    @Column({
        type: 'number',
    })
    weapon: number;

    @ApiProperty({enum: loadoutArray, description: 'Loadout of killed character'})
    @Column({
        type: 'enum',
        enum: loadoutArray,
    })
    characterLoadout: Loadout;

    @ApiProperty({example: false, description: 'Whether the kill was from a headshot'})
    @Column({
        type: 'boolean',
    })
    isHeadshot: boolean;

    @ApiProperty({example: 0, description: 'Type of kill'})
    @Column({
        type: 'number',
    })
    killType: number;

    @ApiProperty({example: 3, description: 'Vehicle ID used to kill if applicable'})
    @Column({
        type: 'number',
        nullable: true,
    })
    vehicle?: number;
}
