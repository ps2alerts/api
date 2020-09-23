import {Controller, Get} from '@nestjs/common';

@Controller()
export class DefaultController {
    @Get('/')
    getHello(): string {
        return 'Welcome to the PS2Alerts API! Please visit our github project for information on how to get an API key / documentation';
    }
}
