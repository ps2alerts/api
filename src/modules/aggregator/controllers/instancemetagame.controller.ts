import {Controller} from '@nestjs/common';
import {MessagePattern, Payload} from '@nestjs/microservices';

interface InstanceMetagameMessageData {
    instanceId: string;
    type: string;
}

@Controller()
export default class InstanceMetagameController {
    // CREATE

    // PATCH

    // MQHANDLE
    @MessagePattern('instanceMetagame')
    handleMessage(@Payload() data: InstanceMetagameMessageData): void {
        console.log('instanceMetagame', data);

        // If starting
    }
}
