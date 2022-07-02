/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Column} from 'typeorm';
import {Faction} from '../../../ps2alerts-constants/faction';

export default class ItemEmbed {
    @ApiProperty({example: 882, description: 'Census ID of the item'})
    @Column({
        type: 'number',
    })
    id: number;

    @ApiProperty({example: 'Sticky Grenade', description: 'Name of the item'})
    @Column({
        type: 'number',
    })
    name: number;

    @ApiProperty({example: 1, description: 'Faction ID of the item'})
    @Column({
        type: 'number',
    })
    faction: Faction;

    @ApiProperty({example: 17, description: 'Category ID of the item'})
    @Column({
        type: 'number',
    })
    categoryId: number;

    @ApiProperty({example: false, description: 'If is vehicle weapon or not'})
    @Column({
        type: 'boolean',
    })
    isVehicleWeapon: boolean;
}
