<?php

namespace Ps2alerts\Api\Transformer\Profiles;

use League\Fractal\TransformerAbstract;

class PlayerWeaponTransformer extends TransformerAbstract
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
            'kills' => (int) $data['kills'],
            'headshots' => (int) $data['headshots'],
            'teamkills' => (int) $data['teamkills']
        ];
    }
}
