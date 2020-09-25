import {Controller} from '@nestjs/common';
import {MessagePattern, Payload} from '@nestjs/microservices';

interface InstanceMetagameMessageData {
    instanceId: string;
    type: string;
}

@Controller()
export default class AggregatorInstanceMetagameEventController {
    // CREATE

    // PATCH

    // MQHANDLE
    @MessagePattern('instanceMetagame')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleMessage(@Payload() data: InstanceMetagameMessageData): void {

        // If starting
    }
}
