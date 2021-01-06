/* eslint-disable @typescript-eslint/naming-convention */
import {Ps2alertsEventState} from '../../data/constants/eventstate.consts';
import {Bracket} from '../../data/constants/bracket.consts';

interface MatchInterface {
    $match: {
        state: Ps2alertsEventState.ENDED;
        bracket?: Bracket;
    };
}
export const instancePipelineMatch: MatchInterface = {
    $match: {
        state: Ps2alertsEventState.ENDED,
    },
};

export const instanceDailyCounts = {
    $facet: {
        dailyAlerts: [
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$timeStarted',
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ],
        vsDailyWins: [
            {
                $match: {
                    'result.victor': 1,
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$timeStarted',
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ],
        ncDailyWins: [
            {
                $match: {
                    'result.victor': 2,
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$timeStarted',
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ],
        trDailyWins: [{
            $match: {
                'result.victor': 3,
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$timeStarted',
                    },
                },
                count: {
                    $sum: 1,
                },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        }],
    },
};
