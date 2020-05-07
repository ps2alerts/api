<?php

namespace Ps2alerts\Api\Transformer\Data;

use League\Fractal\TransformerAbstract;

class OutfitTransformer extends TransformerAbstract
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
        $obj = [
            'id'          => (string) $data->outfit_id, // Bigint
            'name'        => (string) $data->name,
            'tag'         => (! empty($data->alias)) ? (string) $data->alias : null,
            'faction'     => (int) $data->leader->faction_id,
            'count'       => (int) $data->member_count,
            'leader'      => (string) $data->leader_character_id,
            'server'      => (int) $data->server,
            'environment' => (string) $data->environment,
            'entered'     => (int) date('U')
        ];

        return $obj;
    }
}
