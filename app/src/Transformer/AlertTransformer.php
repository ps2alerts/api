<?php

namespace Ps2alerts\Api\Transformer;

use League\Fractal\TransformerAbstract;
use Ps2alerts\Api\Repository\Metrics\ClassRepository;
use Ps2alerts\Api\Repository\Metrics\CombatHistoryRepository;
use Ps2alerts\Api\Repository\Metrics\CombatRepository;
use Ps2alerts\Api\Repository\Metrics\MapInitialRepository;
use Ps2alerts\Api\Repository\Metrics\MapRepository;
use Ps2alerts\Api\Repository\Metrics\OutfitRepository;
use Ps2alerts\Api\Repository\Metrics\PlayerRepository;
use Ps2alerts\Api\Repository\Metrics\PopulationRepository;
use Ps2alerts\Api\Repository\Metrics\VehicleTotalRepository;
use Ps2alerts\Api\Repository\Metrics\WeaponTotalRepository;
use Ps2alerts\Api\Repository\Metrics\XpRepository;

use Ps2alerts\Api\Transformer\Metrics\ClassTransformer;
use Ps2alerts\Api\Transformer\Metrics\CombatHistoryTransformer;
use Ps2alerts\Api\Transformer\Metrics\CombatTransformer;
use Ps2alerts\Api\Transformer\Metrics\MapInitialTransformer;
use Ps2alerts\Api\Transformer\Metrics\MapTransformer;
use Ps2alerts\Api\Transformer\Metrics\OutfitTransformer;
use Ps2alerts\Api\Transformer\Metrics\PlayerTransformer;
use Ps2alerts\Api\Transformer\Metrics\PopulationTransformer;
use Ps2alerts\Api\Transformer\Metrics\VehicleTransformer;
use Ps2alerts\Api\Transformer\Metrics\WeaponTransformer;
use Ps2alerts\Api\Transformer\Metrics\XpTransformer;

class AlertTransformer extends TransformerAbstract
{
    /**
     * List of available includes to this resource
     *
     * @var array
     */
    protected $availableIncludes = [
        'classes',
        'combatHistorys',
        'combats',
        'mapInitials',
        'maps',
        'outfits',
        'players',
        'populations',
        'vehicles',
        'weapons',
        'xps'
    ];

    /**
     * Repositories
     */
    protected $classRepo;
    protected $combatHistoryRepo;
    protected $combatRepo;
    protected $mapInitialRepo;
    protected $mapRepo;
    protected $outfitRepo;
    protected $playerRepo;
    protected $populationRepo;
    protected $vehicleRepo;
    protected $weaponRepo;
    protected $xpRepo;

    /**
     * Constructor
     *
     * @param ClassRepository         $classRepo
     * @param CombatHistoryRepository $combatHistoryRepo
     * @param CombatRepository        $combatRepo
     * @param MapInitialRepository    $mapInitialRepo
     * @param MapRepository           $mapRepo
     * @param OutfitRepository        $outfitRepo
     * @param PlayerRepository        $playerRepo
     * @param PopulationRepository    $populationRepo
     * @param VehicleTotalRepository  $vehicleRepo
     * @param WeaponTotalRepository   $weaponRepo
     * @param XpRepository            $xpRepo
     */
    public function __construct(
        ClassRepository         $classRepo,
        CombatHistoryRepository $combatHistoryRepo,
        CombatRepository        $combatRepo,
        MapInitialRepository    $mapInitialRepo,
        MapRepository           $mapRepo,
        OutfitRepository        $outfitRepo,
        PlayerRepository        $playerRepo,
        PopulationRepository    $populationRepo,
        VehicleTotalRepository  $vehicleRepo,
        WeaponTotalRepository   $weaponRepo,
        XpRepository            $xpRepo
    ) {
        $this->classRepo         = $classRepo;
        $this->combatHistoryRepo = $combatHistoryRepo;
        $this->combatRepo        = $combatRepo;
        $this->mapInitialRepo    = $mapInitialRepo;
        $this->mapRepo           = $mapRepo;
        $this->outfitRepo        = $outfitRepo;
        $this->playerRepo        = $playerRepo;
        $this->populationRepo    = $populationRepo;
        $this->vehicleRepo       = $vehicleRepo;
        $this->weaponRepo        = $weaponRepo;
        $this->xpRepo            = $xpRepo;
    }

    /**
     * The tranform method required by Fractal to parse the data and return proper typing and fields.
     *
     * @param  array $data Data to transform
     *
     * @return array
     */
    public function transform($data)
    {
        return [
            'id'           => (int) $data['ResultID'],
            'started'      => (int) $data['ResultStartTime'],
            'ended'        => (int) $data['ResultEndTime'],
            'server'       => (int) $data['ResultServer'],
            'zone'         => (int) $data['ResultAlertCont'],
            'winner'       => (string) $data['ResultWinner'],
            'timeBracket'  => (string) $data['ResultTimeType'],
            'isDraw'       => (boolean) $data['ResultDraw'],
            'isDomination' => (boolean) $data['ResultDomination'],
            'isValid'      => (boolean) $data['Valid'],
            'inProgress'   => (boolean) $data['InProgress'],
            'archived'     => (boolean) $data['Archived']
        ];
    }

    /**
     * Gets the Class data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeClasses($data)
    {
        $data = $this->classRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($data, new ClassTransformer);
    }

    /**
     * Gets the Combat History data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeCombatHistorys($data)
    {
        $data = $this->combatHistoryRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($data, new CombatHistoryTransformer);
    }

    /**
     * Gets the Combat data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Item
     */
    public function includeCombats($data)
    {
        $data = $this->combatRepo->readSingleById($data['ResultID'], 'result');
        return $this->item($data, new CombatTransformer);
    }

    /**
     * Gets the Class data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeMapInitials($data)
    {
        $data = $this->mapInitialRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($data, new MapInitialTransformer);
    }

    /**
     * Gets the Map data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeMaps($data)
    {
        $data = $this->mapRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($data, new MapTransformer);
    }

    /**
     * Gets the Outfit data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeOutfits($data)
    {
        $data = $this->outfitRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($data, new OutfitTransformer);
    }

    /**
     * Gets the Popualtion data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includePopulations($data)
    {
        $data = $this->populationRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($data, new PopulationTransformer);
    }

    /**
     * Gets the Player data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includePlayers($data)
    {
        $data = $this->playerRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($data, new PlayerTransformer);
    }

    /**
     * Gets the Vehicle data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeVehicles($data)
    {
        $data = $this->vehicleRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($data, new VehicleTransformer);
    }

    /**
     * Gets the Weapon data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeWeapons($data)
    {
        $map = $this->weaponRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($map, new WeaponTransformer);
    }

    /**
     * Gets the XP data and then adds it to the result
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeXps($data)
    {
        // NOTE TO SELF: RATE LIMIT THIS BAD BOY
        $map = $this->xpRepo->readAllById($data['ResultID'], 'result');
        return $this->collection($map, new XpTransformer);
    }
}
