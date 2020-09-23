import {Controller, Get} from '@nestjs/common';

@Controller('instances')
export class InstancesController {
    @Get()
    findAll(): string {
        return 'This action returns all instances.';
    }
}
