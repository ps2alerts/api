import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';

export abstract class BaseGlobalAggregateController {
    // If OW, force bracket to be total as brackets don't make sense in OW context
    public correctBracket(bracket: Bracket | undefined, ps2AlertsEventType: Ps2AlertsEventType | undefined): Bracket {
        if (!bracket || !ps2AlertsEventType || ps2AlertsEventType === Ps2AlertsEventType.OUTFIT_WARS_AUG_2022) {
            return Bracket.TOTAL;
        }

        return bracket;
    }
}
