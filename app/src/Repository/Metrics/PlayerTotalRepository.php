<?php

namespace Ps2alerts\Api\Repository\Metrics;

use Ps2alerts\Api\Repository\AbstractEndpointRepository;

class PlayerTotalRepository extends AbstractEndpointRepository
{
    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return 'ws_players_total';
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryKey()
    {
        return 'playerID';
    }

    /**
     * {@inheritdoc}
     */
    public function getResultKey()
    {
        return $this->getPrimaryKey();
    }
}
