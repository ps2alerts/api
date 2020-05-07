<?php

namespace Ps2alerts\Api\ServiceProvider;

use League\Container\ServiceProvider\AbstractServiceProvider;

class ConfigServiceProvider extends AbstractServiceProvider
{
    /**
     * @var array
     */
    protected $provides = [
        'config'
    ];

    /**
     * {@inheritdoc}
     */
    public function register()
    {
        $this->getContainer()->share('config', function () {
            return [
                'environment' => $_ENV['ENVIRONMENT'],
                'base_url' => $_ENV['BASE_URL'],
                'logger' => 'file',
                'census_service_id' => $_ENV['CENSUS_SERVICE_ID'],
                'database' => [
                    'host'     => $_ENV['DB_HOST'],
                    'port'     => $_ENV['DB_PORT'],
                    'user'     => $_ENV['DB_USER'],
                    'password' => $_ENV['DB_PASS'],
                    'schema'   => $_ENV['DB_NAME']
                ],
                'database_data' => [
                    'host'      => $_ENV['DB_HOST'],
                    'port'      => $_ENV['DB_PORT'],
                    'user'      => $_ENV['DB_USER'],
                    'password'  => $_ENV['DB_PASS'],
                    'schema'    => (!empty($_ENV['DB_NAME_DATA'])) ? $_ENV['DB_NAME_DATA'] : 'ps2alerts_data'
                ],
                'database_archive' => [
                    'host'     => $_ENV['DB_HOST'],
                    'port'     => $_ENV['DB_PORT'],
                    'user'     => $_ENV['DB_USER'],
                    'password' => $_ENV['DB_PASS'],
                    'schema'   => (!empty($_ENV['DB_NAME_ARCHIVE'])) ? $_ENV['DB_NAME_ARCHIVE'] : 'ps2alerts_archive'
                ],
                'redis'        => [
                    'enabled'  => (!empty($_ENV['REDIS_ENABLED'])) ? $_ENV['REDIS_ENABLED'] : false,
                    'host'     => (!empty($_ENV['REDIS_HOST'])) ? $_ENV['REDIS_HOST'] : null,
                    'port'     => (!empty($_ENV['REDIS_PORT'])) ? $_ENV['REDIS_PORT'] : 6379,
                    'pass'     => (!empty($_ENV['REDIS_PASS'])) ? $_ENV['REDIS_PASS'] : null,
                    'db'       => (!empty($_ENV['REDIS_DB']))? $_ENV['REDIS_DB'] : 1,
                ],
                'servers' => [1, 10, 13, 17, 25, 1000, 2000],
                'zones' => [2, 4, 6, 8],
                'classes' => [1, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21],
                'classesGroups' => [
                    'infiltrator' => [1, 8, 15],
                    'la'          => [3, 10, 17],
                    'medic'       => [4, 11, 18],
                    'engineer'    => [5, 12, 19],
                    'ha'          => [6, 13, 20],
                    'max'         => [7, 14, 21]
                ],
                'classesFactions' => [
                    'nc' => [1, 3, 4, 5, 6, 7],
                    'tr' => [8, 10, 11, 12, 13, 14],
                    'vs' => [15, 17, 18, 19, 20, 21]
                ],
                'factions' => ['vs', 'nc', 'tr', 'draw'],
                'brackets' => ['MOR', 'AFT', 'PRI'],
                'commands_path' => 'src/Command'
            ];
        });
    }
}
