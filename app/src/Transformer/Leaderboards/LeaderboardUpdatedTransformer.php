<?php

namespace Ps2alerts\Api\Transformer\Leaderboards;

use League\Fractal\TransformerAbstract;

class LeaderboardUpdatedTransformer extends TransformerAbstract
{
    /**
     * The transform method required by Fractal to parse the data and return proper typing and fields.
     *
     * @param  array $data Data to transform
     *
     * @return array
     */
    public function transform($data)
    {
        return [
            'beingUpdated' => (int) $data->beingUpdated,
            'updated'      => (int) $data->lastUpdated,
            'kills'        => (int) $data->playerKills,
            'deaths'       => (int) $data->playerDeaths,
            'teamkills'    => (int) $data->playerTeamkills,
            'suicides'     => (int) $data->playerSuicides,
            'headshots'    => (int) $data->headshots
        ];
    }
}
