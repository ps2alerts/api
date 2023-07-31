/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, ObjectIdColumn, Entity, Index, ObjectID} from 'typeorm';

@Entity({
    name: 'aggregate_instance_populations',
})
@Index(['instance', 'timestamp'], {unique: true})
export default class InstancePopulationAggregateEntity {
    @ObjectIdColumn()
    @Exclude()
    @ApiHideProperty()
    _id: ObjectID;

    @ApiProperty({example: '10-12345', description: 'The Server-CensusInstanceId combination'})
    @Column({
        type: 'string',
    })
    instance: string;

    @ApiProperty({example: new Date(), description: 'Timestamp of the aggregate instance reported in UTC'})
    @Column({
        type: 'date',
    })
    timestamp: Date;

    @ApiProperty({example: 184, description: 'Total population of VS faction'})
    @Column({
        type: 'number',
        default: 0,
    })
    vs: number;

    @ApiProperty({example: 184, description: 'Total population of NC faction'})
    @Column({
        type: 'number',
        default: 0,
    })
    nc: number;

    @ApiProperty({example: 184, description: 'Total population of TR faction'})
    @Column({
        type: 'number',
        default: 0,
    })
    tr: number;

    @ApiProperty({example: 184, description: 'Total population of NSO faction'})
    @Column({
        type: 'number',
        default: 0,
    })
    nso: number;

    @ApiProperty({example: 184, description: 'Total population of all factions'})
    @Column({
        type: 'number',
        default: 0,
    })
    total: number;
}
