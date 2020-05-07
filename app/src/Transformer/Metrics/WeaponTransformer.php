<?php

namespace Ps2alerts\Api\Transformer\Metrics;

use League\Fractal\TransformerAbstract;

class WeaponTransformer extends TransformerAbstract
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
            'id'        => (int) $data['weaponID'],
            'kills'     => (int) $data['killCount'],
            'headshots' => (int) $data['headshots'],
            'teamkills' => (int) $data['teamkills']
        ];
    }
}
