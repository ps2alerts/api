import {ClassSerializerInterceptor, HttpModule, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import RedriveRequestEntity from '../data/entities/redrive/redrive.request.entity';
import RedriveController from './controllers/redrive.controller';
import {AuthModule} from '../../auth/auth.module';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {RedriveCron} from './cron/redrive.cron';

@Module({
    controllers: [
        RedriveController,
    ],
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([
            RedriveRequestEntity,
        ]),
        AuthModule,
    ],
    providers: [
        {provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor},
        MongoOperationsService,
        RedriveCron,
    ],
})
export class RedriverModule {}
