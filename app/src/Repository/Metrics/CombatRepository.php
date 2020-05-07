<?php

namespace Ps2alerts\Api\Repository\Metrics;

use Ps2alerts\Api\Repository\AbstractEndpointRepository;

class CombatRepository extends AbstractEndpointRepository
{
    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return 'ws_factions';
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryKey()
    {
        return 'resultID';
    }

    /**
     * {@inheritdoc}
     */
    public function getResultKey()
    {
        return $this->getPrimaryKey();
    }
}
