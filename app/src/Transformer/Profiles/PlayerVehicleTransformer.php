<?php

namespace Ps2alerts\Api\Transformer\Profiles;

use League\Fractal\TransformerAbstract;

class PlayerVehicleTransformer extends TransformerAbstract
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
            'id'    => (int) $data['id'],
            'kills' => [
                'infrantry' => $data['killsInf'],
                'vehicles'  => $data['killsVeh'],
                'total'     => $data['kills']
            ],
            'deaths' => [
                'infrantry' => $data['deathsInf'],
                'vehicles'  => $data['deathsVeh'],
                'total'     => $data['deaths'],
            ],
            'bails' => $data['bails']
        ];
    }
}
