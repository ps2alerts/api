<?php

namespace Ps2alerts\Api\Repository\Data;

use Ps2alerts\Api\Repository\AbstractDataEndpointRepository;

class VehicleDataRepository extends AbstractDataEndpointRepository
{
    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return 'vehicle_data';
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryKey()
    {
        return 'vehicleID';
    }

    /**
     * {@inheritdoc}
     */
    public function getResultKey()
    {
        return $this->getPrimaryKey();
    }
}
