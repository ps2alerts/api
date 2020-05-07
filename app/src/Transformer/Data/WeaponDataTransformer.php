<?php

namespace Ps2alerts\Api\Transformer\Data;

use League\Fractal\TransformerAbstract;

class WeaponDataTransformer extends TransformerAbstract
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
            'name'      => (string) $data['weaponName'],
            'faction'   => (int) $data['weaponFaction'],
            'isVehicle' => (int) $data['weaponIsVehicle'],
            'category'  => (int) $data['weaponCategory']
        ];
    }
}
