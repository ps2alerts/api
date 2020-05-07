<?php

namespace Ps2alerts\Api\Command;

use Symfony\Component\Console\Command\Command;

abstract class BaseCommand extends Command
{
    protected $db;
    protected $auraFactory;
    protected $container;

    protected function configure()
    {
        $container = include __DIR__ . '/../container.php';

        $this->container   = $container;
        $this->auraFactory = $container->get('Ps2alerts\Api\Factory\AuraFactory');
        $this->db          = $container->get('Database');
    }
}
