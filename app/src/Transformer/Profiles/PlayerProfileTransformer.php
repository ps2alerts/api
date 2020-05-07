<?php

namespace Ps2alerts\Api\Transformer\Profiles;

use League\Fractal\TransformerAbstract;
use Ps2alerts\Api\Contract\HttpClientAwareInterface;
use Ps2alerts\Api\Contract\HttpClientAwareTrait;
use Ps2alerts\Api\Repository\Metrics\OutfitTotalRepository;
use Ps2alerts\Api\Repository\Metrics\PlayerRepository;
use Ps2alerts\Api\Repository\Metrics\VehicleRepository;
use Ps2alerts\Api\Repository\Metrics\WeaponRepository;
use Ps2alerts\Api\Transformer\Profiles\PlayerCensusTransformer;
use Ps2alerts\Api\Transformer\Profiles\PlayerInvolvementTransformer;
use Ps2alerts\Api\Transformer\Profiles\PlayerMetricsTransformer;
use Ps2alerts\Api\Transformer\Profiles\PlayerOutfitTransformer;

class PlayerProfileTransformer extends TransformerAbstract implements HttpClientAwareInterface
{
    use HttpClientAwareTrait;

    /**
     * List of available includes to this resource
     *
     * @var array
     */
    protected $availableIncludes = [
        'census',
        'involvement',
        'metrics',
        'outfit',
        //'vehicles',
        'weapons'
    ];

    protected $outfitTotalRepo;
    protected $playerRepo;
    protected $vehicleRepo;
    protected $weaponRepo;

    public function __construct(
        OutfitTotalRepository $outfitTotalRepo,
        PlayerRepository      $playerRepo,
        VehicleRepository     $vehicleRepo,
        WeaponRepository      $weaponRepo
    ) {
        $this->outfitTotalRepo = $outfitTotalRepo;
        $this->playerRepo      = $playerRepo;
        $this->vehicleRepo     = $vehicleRepo;
        $this->weaponRepo      = $weaponRepo;
    }

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
            'id'      => (string) $data['playerID'], // Bigint
            'name'    => (string) $data['playerName'],
            'outfit'  => (string) $data['playerOutfit'], // Bigint
            'faction' => (int) $data['playerFaction'],
            'server'  => (int) $data['playerServer']
        ];
    }

    /**
     * Grab Census only info
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeCensus($data)
    {
        $client = $this->getHttpClientDriver();

        $namespace = 'ps2:v2';

        if ($data['playerServer'] >= 2000) {
            $namespace = 'ps2ps4eu';
        } elseif ($data['playerServer'] >= 1000) {
            $namespace = 'ps2ps4us';
        }

        $response = $client->get(
            "https://census.daybreakgames.com/s:planetside2alertstats/get/{$namespace}/character/{$data['playerID']}?c:resolve=stat,stat_by_faction"
        );

        $json = json_decode($response->getBody()->getContents(), true);

        $character = $json['character_list'][0];

        $statCount = count($character['stats']['stat']);
        $statFactionCount = count($character['stats']['stat_by_faction']);

        $character['kills']     = 0;
        $character['deaths']    = 0;
        $character['headshots'] = 0;

        for ($i = 0; $i < $statFactionCount; $i++) {
            $row = $character['stats']['stat_by_faction'][$i];

            if ($row['stat_name'] === 'weapon_kills') {
                $character['kills'] = ($row['value_forever_nc'] + $row['value_forever_tr']);
            }

            if ($row['stat_name'] === 'weapon_headshots') {
                $character['headshots'] = ($row['value_forever_nc'] + $row['value_forever_tr']);
            }
        }

        for ($i = 0; $i < $statCount; $i++) {
            $row = $character['stats']['stat'][$i];

            if ($row['stat_name'] === 'weapon_deaths') {
                $character['deaths'] = $row['value_forever'];
            }
        }

        // Removes daft ".0" from the end of the login string...
        $character['times']['last_login_date'] = str_replace('.0', '', $character['times']['last_login_date']);

        return $this->item($character, new PlayerCensusTransformer);
    }

    /**
     * Get Alert involvement & metrics
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeInvolvement($data)
    {
        $data = $this->playerRepo->readAllByIdWithArchive($data['playerID'], 'playerID');

        return $this->collection($data, new PlayerInvolvementTransformer);
    }

    /**
     * Gets Metrics for a player
     *
     * @param  array $player
     *
     * @return array
     */
    public function includeMetrics($data)
    {
        $metrics = [
            'kills'     => 0,
            'deaths'    => 0,
            'teamkills' => 0,
            'suicides'  => 0,
            'headshots' => 0
        ];

        $alerts = $this->playerRepo->readAllByIdWithArchive($data['playerID'], 'playerID');
        $count = count($alerts);
        $metrics['involvement'] = $count;

        // Calculate metrics
        for ($i = 0; $i < $count; $i++) {
            $metrics['kills']     = $metrics['kills'] + $alerts[$i]['playerKills'];
            $metrics['deaths']    = $metrics['deaths'] + $alerts[$i]['playerDeaths'];
            $metrics['teamkills'] = $metrics['teamkills'] + $alerts[$i]['playerTeamKills'];
            $metrics['suicides']  = $metrics['suicides'] + $alerts[$i]['playerSuicides'];
            $metrics['headshots'] = $metrics['headshots'] + $alerts[$i]['headshots'];
        }

        return $this->item($metrics, new PlayerMetricsTransformer);
    }

    /**
     * Get Outfit info and metrics
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeOutfit($data)
    {
        $data = $this->outfitTotalRepo->readSingleById($data['playerOutfit'], 'primary');
        return $this->item($data, new PlayerOutfitTransformer);
    }

    /**
     * Get Vehicle info and metrics
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeVehicles($data)
    {
        $metrics = [];
        $data = $this->vehicleRepo->readAllByIdWithArchive($data['playerID'], 'playerID');
        $count = count($data);

        // Calculate metrics
        for ($i = 0; $i < $count; $i++) {
            $vehicleID = $data[$i]['vehicleID'];
            if (empty($metrics[$vehicleID])) {
                $metrics[$vehicleID] = [
                    'id'        => $vehicleID,
                    'kills'     => 0,
                    'killsInf'  => 0,
                    'killsVeh'  => 0,
                    'deaths'    => 0,
                    'deathsInf' => 0,
                    'deathsVeh' => 0,
                    'bails'     => 0
                ];
            }

            $metrics[$vehicleID]['kills']     = $metrics[$vehicleID]['kills'] + $data[$i]['killCount'];
            $metrics[$vehicleID]['killsInf']  = $metrics[$vehicleID]['killsInf'] + $data[$i]['killICount'];
            $metrics[$vehicleID]['killsVeh']  = $metrics[$vehicleID]['killsVeh'] + $data[$i]['killVCount'];
            $metrics[$vehicleID]['deaths']    = $metrics[$vehicleID]['deaths'] + $data[$i]['deathCount'];
            $metrics[$vehicleID]['deathsInf'] = $metrics[$vehicleID]['deathsInf'] + $data[$i]['deathICount'];
            $metrics[$vehicleID]['deathsVeh'] = $metrics[$vehicleID]['deathsVeh'] + $data[$i]['deathVCount'];
            $metrics[$vehicleID]['bails']     = $metrics[$vehicleID]['bails'] + $data[$i]['bails'];
        }

        return $this->collection($metrics, new PlayerVehicleTransformer);
    }

    /**
     * Get Weapon info and metrics
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeWeapons($data)
    {
        $metrics = [];
        $data = $this->weaponRepo->readAllByIdWithArchive($data['playerID'], 'playerID');
        $count = count($data);

        // Calculate metrics
        for ($i = 0; $i < $count; $i++) {
            $weaponID = $data[$i]['weaponID'];
            if (empty($metrics[$weaponID])) {
                $metrics[$weaponID] = [
                    'id'        => $weaponID,
                    'kills'     => 0,
                    'headshots' => 0,
                    'teamkills' => 0
                ];
            }

            $metrics[$weaponID]['kills']     = $metrics[$weaponID]['kills'] + $data[$i]['killCount'];
            $metrics[$weaponID]['headshots'] = $metrics[$weaponID]['headshots'] + $data[$i]['headshots'];
            $metrics[$weaponID]['teamkills'] = $metrics[$weaponID]['teamkills'] + $data[$i]['teamkills'];
        }

        return $this->collection($metrics, new PlayerWeaponTransformer);
    }
}
