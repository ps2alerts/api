<?php

namespace Ps2alerts\Api\Transformer\Metrics;

use League\Fractal\TransformerAbstract;

class VehicleTransformer extends TransformerAbstract
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
            'id' => (int) $data['vehicleID'],
            'kills' => [
                'infantry' => (int) $data['killICount'],
                'vehicle'  => (int) $data['killVCount'],
                'total'    => (int) $data['killCount'],
            ],
            'deaths' => [
                'infantry' => (int) $data['deathICount'],
                'vehicle'  => (int) $data['deathVCount'],
                'total'    => (int) $data['deathCount'],
            ],
            'bails' => (int) $data['bails']
        ];
    }
}
