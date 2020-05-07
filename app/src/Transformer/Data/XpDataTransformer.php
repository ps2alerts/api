<?php

namespace Ps2alerts\Api\Transformer\Data;

use League\Fractal\TransformerAbstract;

class XpDataTransformer extends TransformerAbstract
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
            'id'     => (int) $data['id'],
            'name'   => (string) $data['description'],
            'amount' => (int) $data['xp'],
        ];
    }
}
