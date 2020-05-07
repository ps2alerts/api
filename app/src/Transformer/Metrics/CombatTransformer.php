<?php

namespace Ps2alerts\Api\Transformer\Metrics;

use League\Fractal\TransformerAbstract;

class CombatTransformer extends TransformerAbstract
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
            'kills' => [
                'vs'    => (int) $data['killsVS'],
                'nc'    => (int) $data['killsNC'],
                'tr'    => (int) $data['killsTR'],
                'total' => (int) $data['totalKills'],
            ],
            'deaths' => [
                'vs'    => (int) $data['deathsVS'],
                'nc'    => (int) $data['deathsNC'],
                'tr'    => (int) $data['deathsTR'],
                'total' => (int) $data['totalDeaths'],
            ],
            'teamkills' => [
                'vs'    => (int) $data['teamKillsVS'],
                'nc'    => (int) $data['teamKillsNC'],
                'tr'    => (int) $data['teamKillsTR'],
                'total' => (int) $data['totalTKs'],
            ],
            'suicides' => [
                'vs'    => (int) $data['suicidesVS'],
                'nc'    => (int) $data['suicidesNC'],
                'tr'    => (int) $data['suicidesTR'],
                'total' => (int) $data['totalSuicides'],
            ]
        ];
    }
}
