<?php

namespace Ps2alerts\Api\Transformer\Profiles;

use League\Fractal\TransformerAbstract;

class OutfitPlayersTransformer extends TransformerAbstract
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
            'id'        => (string) $data['playerID'], // Bigint
            'name'      => (string) $data['playerName'],
            'kills'     => (int) $data['playerKills'],
            'deaths'    => (int) $data['playerDeaths'],
            'teamkills' => (int) $data['playerTeamKills'],
            'suicides'  => (int) $data['playerSuicides'],
            'headshots' => (int) $data['headshots'],
        ];
    }
}
