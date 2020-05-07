<?php

use Ps2alerts\Api\Command\ArchiveCommand;
use Ps2alerts\Api\Command\DeleteAlertCommand;
use Ps2alerts\Api\Command\DeleteMissingAlertsCommand;
use Ps2alerts\Api\Command\LeaderboardCheckCommand;
use Ps2alerts\Api\Command\LeaderboardOutfitsCommand;
use Ps2alerts\Api\Command\LeaderboardPlayersCommand;
use Ps2alerts\Api\Command\TestCommand;
use Symfony\Component\Console\Application;

require __DIR__ . '/../vendor/autoload.php';

// ENV loading
josegonzalez\Dotenv\Loader::load([
    'filepath' => __DIR__ . '/../.env',
    'toEnv'    => true
]);

include __DIR__ . '/Command/CommandsCommon.php';

$application = new Application();
// List commands here
$application->add(new ArchiveCommand());
$application->add(new DeleteAlertCommand());
$application->add(new DeleteMissingAlertsCommand());
$application->add(new LeaderboardCheckCommand());
$application->add(new LeaderboardOutfitsCommand());
$application->add(new LeaderboardPlayersCommand());
$application->add(new TestCommand());
$application->run();
