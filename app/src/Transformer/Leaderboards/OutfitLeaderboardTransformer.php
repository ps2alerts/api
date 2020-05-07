<?php

namespace Ps2alerts\Api\Transformer\Leaderboards;

use League\Fractal\TransformerAbstract;

class OutfitLeaderboardTransformer extends TransformerAbstract
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
            'id'        => (string) $data['outfitID'],
            'name'      => (string) $data['outfitName'],
            'tag'       => (string) $data['outfitTag'],
            'server'    => (int) $data['outfitServer'],
            'faction'   => (int) $data['outfitFaction'],
            'kills'     => (int) $data['outfitKills'],
            'deaths'    => (int) $data['outfitDeaths'],
            'teamkills' => (int) $data['outfitTKs'],
            'suicides'  => (int) $data['outfitSuicides'],
            'captures'  => (int) $data['outfitCaptures']
        ];
    }
}
