import {Controller} from "@nestjs/common";
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";

interface AggregatorMqMessage {

}

@Controller()
export default class AggregatorMqController {
    @MessagePattern('metagame_instances')
        getNotifications(@Payload() data: any, @Ctx() context: RmqContext): void {
        console.log(data);
    }
}