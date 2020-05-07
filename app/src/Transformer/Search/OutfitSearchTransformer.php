<?php

namespace Ps2alerts\Api\Transformer\Search;

use League\Fractal\TransformerAbstract;

class OutfitSearchTransformer extends TransformerAbstract
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
            'id'        => (string) $data['outfitID'], // Bigint
            'name'      => (string) $data['outfitName'],
            'tag'       => (string) $data['outfitTag'],
            'faction'   => (int) $data['outfitFaction'],
            'server'    => (int) $data['outfitServer'],
            'kills'     => (int) $data['outfitKills'],
            'deaths'    => (int) $data['outfitDeaths'],
            'teamkills' => (int) $data['outfitTKs'],
            'suicides'  => (int) $data['outfitSuicides']
        ];
    }
}
