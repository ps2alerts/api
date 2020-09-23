import {Controller, Get, Param} from '@nestjs/common';
import Metagame from '../../data/entities/instance/metagame.entity';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';

@ApiTags('instances')
@Controller('instances')
export class InstancesController {
    @Get('/metagame')
    @ApiOperation({summary: 'Return a paginated list of metagame instances'})
    findAll(): string {
        return 'This action returns all instances.';
    }

    @Get('/metagame/:id')
    @ApiOperation({summary: 'Returns a single metagame instance'})
    @ApiResponse({
        status: 200,
        description: 'The Metagame Instance',
        type: Metagame,
    })
    findOne(@Param('id') id: string): string {
        return `Instance #${+id}`;
    }
}
