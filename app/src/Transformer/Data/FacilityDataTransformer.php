<?php

namespace Ps2alerts\Api\Transformer\Data;

use League\Fractal\TransformerAbstract;

class FacilityDataTransformer extends TransformerAbstract
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
            'id'    => (int) $data['facilityID'],
            'name'  => (string) $data['facilityName'],
            'type'  => (int) $data['facilityType'],
            'zone'  => (int) $data['zone'],
            'mapId' => (int) $data['facilityMapID']
        ];
    }
}
