import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";

interface InstanceMetagameMessageData {
    instanceId: string;
    type: string
}

@Controller()
export default class InstanceDeathController {
    // CREATE


    // PATCH


    // MQHANDLE
    @MessagePattern('instanceDeath')
    handleMessage(@Payload() data: InstanceMetagameMessageData): void {
        console.log('instanceDeath', data);

        // If starting

    }
}