<?php

namespace Ps2alerts\Api\Transformer\Metrics;

use League\Fractal\TransformerAbstract;

class PopulationTransformer extends TransformerAbstract
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
            'timestamp' => (int) $data['timestamp'],
            'vs'        => (int) $data['popsVS'],
            'nc'        => (int) $data['popsNC'],
            'tr'        => (int) $data['popsTR'],
            'total'     => (int) $data['popsTotal'],
        ];
    }
}
