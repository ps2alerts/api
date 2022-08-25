import {Controller} from '@nestjs/common';
import {EventPattern, Payload} from '@nestjs/microservices';
import {MqAcceptedPatterns} from '../../../data/ps2alerts-constants/mqAcceptedPatterns';

interface InstanceMetagameMessageData {
    instanceId: string;
    type: string;
}

@Controller()
export default class AggregatorInstanceMetagameEventController {
    // CREATE

    // PATCH

    // MQHANDLE
    @EventPattern(MqAcceptedPatterns.INSTANCE_METAGAME)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleMessage(@Payload() data: InstanceMetagameMessageData): void {

        // If starting
    }
}
