import {Controller, Get} from '@nestjs/common';

@Controller()
export class DefaultController {
    @Get('/hello')
    getHello(): string {
        return 'Hello there, General Kenobi';
    }
}
