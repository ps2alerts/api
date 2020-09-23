import {Controller, Get, Param} from '@nestjs/common';
import Metagame from '../../data/entities/instance/metagame.entity';
import {ApiResponse} from '@nestjs/swagger';

@Controller('instances')
export class InstancesController {
    @Get('/metagame')
    findAll(): string {
        return 'This action returns all instances.';
    }

    @Get('/metagame/:id')
    @ApiResponse({
        status: 200,
        description: 'The Metagame Instance',
        type: Metagame,
    })
    findOne(@Param('id') id: string): string {
        return `Instance #${+id}`;
    }
}
