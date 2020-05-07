<?php

namespace Ps2alerts\Api\Repository\Data;

use Ps2alerts\Api\Repository\AbstractDataEndpointRepository;

class WeaponDataRepository extends AbstractDataEndpointRepository
{
    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return 'weapon_data';
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryKey()
    {
        return 'weaponID';
    }

    /**
     * {@inheritdoc}
     */
    public function getResultKey()
    {
        return $this->getPrimaryKey();
    }
}
