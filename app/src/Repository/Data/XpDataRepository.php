<?php

namespace Ps2alerts\Api\Repository\Data;

use Ps2alerts\Api\Repository\AbstractDataEndpointRepository;

class XpDataRepository extends AbstractDataEndpointRepository
{
    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return 'xp_data';
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryKey()
    {
        return 'id';
    }

    /**
     * {@inheritdoc}
     */
    public function getResultKey()
    {
        return $this->getPrimaryKey();
    }
}
