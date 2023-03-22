/* eslint-disable @typescript-eslint/explicit-member-accessibility,@typescript-eslint/naming-convention */
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {Column, Entity, ObjectID, ObjectIdColumn} from 'typeorm';
import {World} from '../../ps2alerts-constants/world';

export enum RedriveStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETE = 'COMPLETE',
    ERROR = 'ERROR',
}

@Entity({
    name: 'redrive_request',
})

export default class RedriveRequestEntity {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectID;

    @ApiProperty({
        example: new Date(),
        description: 'Start date of the redrive',
    })
    @Column({
        type: 'date',
    })
    dateStart: Date;

    @ApiProperty({
        example: new Date(),
        description: 'End date of the redrive',
    })
    @Column({
        type: 'date',
    })
    dateEnd: Date;

    @ApiProperty({example: World.MILLER, description: 'World to perform the redrives upon'})
    @Column({
        type: 'date',
    })
    world: World;

    @ApiProperty({example: RedriveStatus.RUNNING, description: 'Current status of the redrive'})
    @Column({
        type: 'enum',
        enum: RedriveStatus,
        default: RedriveStatus.PENDING,
    })
    status: RedriveStatus;

    @ApiProperty({example: 2, description: 'Number of Alerts the redrive has processed'})
    @Column({
        type: 'number',
    })
    processed: number;

    @ApiProperty({example: 100, description: 'Total number of Alerts to process'})
    @Column({
        type: 'number',
    })
    totalToProcess: number;

    @ApiProperty({
        example: new Date('2023-02-01T00:00:00.000Z'),
        description: 'When the redrive started',
    })
    @Column({
        type: 'date',
    })
    started: Date;

    @ApiProperty({
        example: new Date('2023-02-01T01:31:00.123Z'),
        description: 'Last time the redrive was last updated',
    })
    @Column({
        type: 'date',
    })
    updated: Date;
}
