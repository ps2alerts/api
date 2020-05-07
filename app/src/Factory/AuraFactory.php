<?php

namespace Ps2alerts\Api\Factory;

use Aura\SqlQuery\QueryFactory;

class AuraFactory
{
    protected $factory;

    public function __construct(QueryFactory $aura)
    {
        $this->factory = $aura;
    }

    public function newSelect()
    {
        return $this->factory->newSelect();
    }

    public function newUpdate()
    {
        return $this->factory->newUpdate();
    }

    public function newDelete()
    {
        return $this->factory->newDelete();
    }
}
