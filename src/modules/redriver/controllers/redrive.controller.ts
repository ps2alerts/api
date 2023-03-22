import {
    Controller,
    Inject,
    Post,
    UseGuards,
    HttpStatus, Body, HttpCode,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiOperation,
    ApiSecurity,
    ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {AuthGuard} from '@nestjs/passport';
import RedriveRequestEntity from '../../data/entities/redrive/redrive.request.entity';
import {RedriveRequestDto} from '../dto/RedriveRequestDto';
import {ObjectID} from 'typeorm';

@ApiTags('Redriving')
@Controller('redrive')
export default class RedriveController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Post('request')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({summary: 'Initiates a metagame event redrive of for a world based on date range'})
    @ApiCreatedResponse({description: 'Redrive Created'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiBadRequestResponse({description: 'Bad request, check your data against the Dto object.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async createOne(
        @Body() entity: RedriveRequestDto,
    ): Promise<ObjectID> {
        return await this.mongoOperationsService.insertOne(RedriveRequestEntity, entity);
    }
}
