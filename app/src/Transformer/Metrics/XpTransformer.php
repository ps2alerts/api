<?php

namespace Ps2alerts\Api\Transformer\Metrics;

use League\Fractal\TransformerAbstract;

class XpTransformer extends TransformerAbstract
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
            'playerID'   => (string) $data['playerID'], // Bigint
            'type'       => (int) $data['type'],
            'occurences' => (int) $data['occurances']
        ];
    }
}
