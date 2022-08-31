import {Injectable, PipeTransform} from '@nestjs/common';
import {Ps2AlertsEventType} from '../../data/ps2alerts-constants/ps2AlertsEventType';

@Injectable()
export class Ps2AlertsEventTypePipe implements PipeTransform {
    transform(value: string | undefined): Ps2AlertsEventType {
        if (!value || value === '') {
            return Ps2AlertsEventType.LIVE_METAGAME;
        }

        return parseInt(value, 10);
    }
}
