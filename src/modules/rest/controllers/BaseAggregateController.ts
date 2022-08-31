import {Ps2AlertsEventType} from '../../data/ps2alerts-constants/ps2AlertsEventType';
import {Bracket} from '../../data/ps2alerts-constants/bracket';

export abstract class BaseAggregateController {
    // If OW, force bracket to be total as brackets don't make sense in OW context
    public correctBracket(bracket: Bracket, ps2AlertsEventType: Ps2AlertsEventType): Bracket {
        return ps2AlertsEventType === Ps2AlertsEventType.OUTFIT_WARS_AUG_2022 ? Bracket.TOTAL : bracket;
    }
}
