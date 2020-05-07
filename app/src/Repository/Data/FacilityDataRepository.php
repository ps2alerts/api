<?php

namespace Ps2alerts\Api\Repository\Data;

use Ps2alerts\Api\Repository\AbstractDataEndpointRepository;

class FacilityDataRepository extends AbstractDataEndpointRepository
{
    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return 'facility_data';
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryKey()
    {
        return 'facilityID';
    }

    /**
     * {@inheritdoc}
     */
    public function getResultKey()
    {
        return $this->getPrimaryKey();
    }
}
