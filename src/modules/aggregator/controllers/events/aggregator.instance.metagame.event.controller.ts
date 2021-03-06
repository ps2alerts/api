import {Controller} from '@nestjs/common';
import {EventPattern, Payload} from '@nestjs/microservices';

interface InstanceMetagameMessageData {
    instanceId: string;
    type: string;
}

@Controller()
export default class AggregatorInstanceMetagameEventController {
    // CREATE

    // PATCH

    // MQHANDLE
    @EventPattern('instanceMetagame')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleMessage(@Payload() data: InstanceMetagameMessageData): void {

        // If starting
    }
}
