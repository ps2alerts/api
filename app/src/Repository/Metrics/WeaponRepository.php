<?php

namespace Ps2alerts\Api\Repository\Metrics;

use Ps2alerts\Api\Repository\AbstractEndpointRepository;

class WeaponRepository extends AbstractEndpointRepository
{
    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return 'ws_weapons';
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryKey()
    {
        return 'dataID';
    }

    /**
     * {@inheritdoc}
     */
    public function getResultKey()
    {
        return 'resultID';
    }
}
