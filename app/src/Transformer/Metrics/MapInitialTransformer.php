<?php

namespace Ps2alerts\Api\Transformer\Metrics;

use League\Fractal\TransformerAbstract;

class MapInitialTransformer extends TransformerAbstract
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
            'facilityID'      => (int) $data['facilityID'],
            'facilityType'    => (int) $data['facilityTypeID'],
            'facilityFaction' => (int) $data['facilityOwner']
        ];
    }
}
