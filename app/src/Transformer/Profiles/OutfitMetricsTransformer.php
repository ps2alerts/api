<?php

namespace Ps2alerts\Api\Transformer\Profiles;

use League\Fractal\TransformerAbstract;

class OutfitMetricsTransformer extends TransformerAbstract
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
            'kills'     => (int) $data['kills'],
            'deaths'    => (int) $data['deaths'],
            'teamkills' => (int) $data['teamkills'],
            'suicides'  => (int) $data['suicides'],
            'involved'  => (int) $data['involvement']
        ];
    }
}
