<?php

namespace Ps2alerts\Api\Transformer\Metrics;

use League\Fractal\TransformerAbstract;

class MapTransformer extends TransformerAbstract
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
            'timestamp'          => (int) $data['timestamp'],
            'facilityID'         => (int) $data['facilityID'],
            'facilityNewFaction' => (int) $data['facilityOwner'],
            'facilityOldFaction' => (int) $data['facilityOldOwner'],
            'durationHeld'       => (int) $data['durationHeld'],
            'controlVS'          => (int) $data['controlVS'],
            'controlNC'          => (int) $data['controlNC'],
            'controlTR'          => (int) $data['controlTR'],
            'server'             => (int) $data['world'],
            'zone'               => (int) $data['zone'],
            'outfitCaptured'     => is_numeric($data['outfitCaptured']) ? (string) $data['outfitCaptured'] : null,
            'isDefence'          => (boolean) $data['defence']
        ];
    }
}
