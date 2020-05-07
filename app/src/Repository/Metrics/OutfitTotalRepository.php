<?php

namespace Ps2alerts\Api\Repository\Metrics;

use Ps2alerts\Api\Repository\AbstractEndpointRepository;

class OutfitTotalRepository extends AbstractEndpointRepository
{
    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return 'ws_outfits_total';
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryKey()
    {
        return 'outfitID';
    }

    /**
     * {@inheritdoc}
     */
    public function getResultKey()
    {
        return $this->getPrimaryKey();
    }
}
