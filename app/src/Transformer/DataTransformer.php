<?php

namespace Ps2alerts\Api\Transformer;

use League\Fractal\TransformerAbstract;
use Ps2alerts\Api\Repository\Data\FacilityDataRepository;
use Ps2alerts\Api\Repository\Data\VehicleDataRepository;
use Ps2alerts\Api\Repository\Data\WeaponDataRepository;
use Ps2alerts\Api\Repository\Data\XpDataRepository;
use Ps2alerts\Api\Transformer\Data\FacilityDataTransformer;
use Ps2alerts\Api\Transformer\Data\VehicleDataTransformer;
use Ps2alerts\Api\Transformer\Data\WeaponDataTransformer;
use Ps2alerts\Api\Transformer\Data\XpDataTransformer;

class DataTransformer extends TransformerAbstract
{
    /**
     * List of available includes to this resource
     *
     * @var array
     */
    protected $availableIncludes = [
        'facilities',
        'vehicles',
        'weapons',
        'xps',
    ];

    /**
     * Repositories
     */
    protected $facilityRepo;
    protected $vehicleRepo;
    protected $weaponRepo;
    protected $xpRepo;

    /**
     * Constructor
     *
     * @param FacilityDataRepository $facilityRepo
     * @param VehicleDataRepository  $vehicleRepo
     * @param WeaponDataRepository   $weaponRepo
     * @param XpDataRepository       $xpRepo
     */
    public function __construct(
        FacilityDataRepository $facilityRepo,
        VehicleDataRepository  $vehicleRepo,
        WeaponDataRepository   $weaponRepo,
        XpDataRepository       $xpRepo
    ) {
        $this->facilityRepo = $facilityRepo;
        $this->vehicleRepo  = $vehicleRepo;
        $this->weaponRepo   = $weaponRepo;
        $this->xpRepo       = $xpRepo;
    }

    /**
     * The tranform method required by Fractal to parse the data and return proper typing and fields.
     *
     * @param  array $data Data to transform
     *
     * @return array
     */
    public function transform()
    {
        return [
            'messsage' => (string) 'Please use embeds to grab data.'
        ];
    }

    /**
     * Grabs all facilities and returns
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeFacilities($data)
    {
        $data = $this->facilityRepo->readAll();
        return $this->collection($data, new FacilityDataTransformer);
    }

    /**
     * Grabs all vehicles and returns
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeVehicles($data)
    {
        $data = $this->vehicleRepo->readAll();
        return $this->collection($data, new VehicleDataTransformer);
    }

    /**
     * Grabs all weapons and returns
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeWeapons($data)
    {
        $data = $this->weaponRepo->readAll();
        return $this->collection($data, new WeaponDataTransformer);
    }

    /**
     * Grabs all XP data and returns
     *
     * @param  array $data
     *
     * @return \League\Fractal\Resource\Collection
     */
    public function includeXps($data)
    {
        $data = $this->xpRepo->readAll();
        return $this->collection($data, new XpDataTransformer);
    }
}
