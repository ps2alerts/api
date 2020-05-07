<?php

namespace Ps2alerts\Api\Transformer\Profiles;

use League\Fractal\TransformerAbstract;

class OutfitInvolvementTransformer extends TransformerAbstract
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
            'id'        => (int) $data['resultID'],
            'kills'     => (int) $data['outfitKills'],
            'deaths'    => (int) $data['outfitDeaths'],
            'teamkills' => (int) $data['outfitTKs'],
            'suicides'  => (int) $data['outfitSuicides']
        ];
    }
}
