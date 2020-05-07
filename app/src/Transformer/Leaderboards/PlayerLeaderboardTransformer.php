<?php

namespace Ps2alerts\Api\Transformer\Leaderboards;

use League\Fractal\TransformerAbstract;

class PlayerLeaderboardTransformer extends TransformerAbstract
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
        if (! isset($data['playerOutfit'])) {
            $outfit = null;
        } else {
            $outfit = $data['playerOutfit'];
        }

        return [
            'id'        => (string) $data['playerID'],
            'name'      => (string) $data['playerName'],
            'faction'   => (int) $data['playerFaction'],
            'server'    => (int) $data['playerServer'],
            'kills'     => (int) $data['playerKills'],
            'deaths'    => (int) $data['playerDeaths'],
            'teamkills' => (int) $data['playerTeamKills'],
            'suicides'  => (int) $data['playerSuicides'],
            'headshots' => (int) $data['headshots'],
            'outfit'    => $outfit
        ];
    }
}
