<?php

namespace Ps2alerts\Api\Transformer\Profiles;

use League\Fractal\TransformerAbstract;

class PlayerCensusTransformer extends TransformerAbstract
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
            'name'           => (string) $data['name']['first'],
            'lastOnline'     => (int) $data['times']['last_login'],
            'lastOnlineDate' => (string) $data['times']['last_login_date'],
            'minutesPlayed'  => (int) $data['times']['minutes_played'],
            'certs' => [
                'earned'    => (int) $data['certs']['earned_points'],
                'spent'     => (int) $data['certs']['spent_points'],
                'available' => (int) $data['certs']['available_points'],
            ],
            'battleRank' => [
                'current'       => (int) $data['battle_rank']['value'],
                'percentToNext' => (int) $data['battle_rank']['percent_to_next'],
            ],
            'stats' => [
                'kills'     => (int) $data['kills'],
                'deaths'    => (int) $data['deaths'],
                'headshots' => (int) $data['headshots']
            ]
        ];
    }
}
