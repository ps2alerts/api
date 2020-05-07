<?php

namespace Ps2alerts\Api\Repository;

use Ps2alerts\Api\Repository\AbstractEndpointRepository;

abstract class AbstractDataEndpointRepository extends AbstractEndpointRepository
{
    /**
     * Overloads the database driver function to pull from the supplemental database instead
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    public function getDbDriver()
    {
        return $this->getDatabaseDataDriver();
    }
}
