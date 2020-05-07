<?php

namespace Ps2alerts\Api\Transformer\Data;

use League\Fractal\TransformerAbstract;

class CharacterTransformer extends TransformerAbstract
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
            'id'          => (string) $data->character_id, // Bigint
            'name'        => (string) $data->name->first,
            'faction'     => (int) $data->faction_id,
            'br'          => (int) $data->battle_rank->value,
            'outfit'      => null,
            'server'      => (int) $data->world_id,
            'environment' => (string) $data->environment,
            'entered'     => (int) date('U')
        ];

        if (isset($data->outfit)) {
            $obj['outfit'] = $data->outfit->outfit_id;
        }

        return $obj;
    }
}
