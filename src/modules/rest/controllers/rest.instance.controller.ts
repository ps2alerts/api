import {ClassSerializerInterceptor, Controller, Get, Param, UseInterceptors} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import InstanceMetagameEntity from '../../data/entities/instance/instance.metagame.entity';

@ApiTags('instances')
@Controller('instances')
export class RestInstanceController {
    private readonly repository: Repository<InstanceMetagameEntity>;

    constructor(
    @InjectRepository(InstanceMetagameEntity) repository: Repository<InstanceMetagameEntity>,
    ) {
        this.repository = repository;
    }

    @Get('/metagame')
    @ApiOperation({summary: 'Return a paginated list of metagame instances'})
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(): Promise<InstanceMetagameEntity[] | undefined> {
        return await this.repository.find();
    }

    @Get('/metagame/:id')
    @ApiOperation({summary: 'Returns a single metagame instance'})
    @ApiResponse({
        status: 200,
        description: 'The Metagame Instance',
        type: InstanceMetagameEntity,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('id') id: string): Promise<InstanceMetagameEntity | undefined> {
        return await this.repository.findOneOrFail({where: {instanceId: id}});
    }
}
