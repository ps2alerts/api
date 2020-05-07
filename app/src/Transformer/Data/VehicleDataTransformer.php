<?php

namespace Ps2alerts\Api\Transformer\Data;

use League\Fractal\TransformerAbstract;

class VehicleDataTransformer extends TransformerAbstract
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
            'id'      => (int) $data['vehicleID'],
            'name'    => (string) $data['vehicleName'],
            'type'    => (string) $data['vehicleType'],
            'faction' => (int) $data['vehicleFaction']
        ];
    }
}
