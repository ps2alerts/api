<?php

namespace Ps2alerts\Api\ServiceProvider;

use Aura\Sql\ExtendedPdo;
use Aura\SqlQuery\QueryFactory;
use League\Container\ServiceProvider\AbstractServiceProvider;

class DatabaseServiceProvider extends AbstractServiceProvider
{
    /**
     * @var array
     */
    protected $provides = [
        'Database',
        'Database\Data',
        'Database\Archive',
        'Aura\SqlQuery\QueryFactory'
    ];

    /**
     * {@inheritdoc}
     */
    public function register()
    {
        $this->getContainer()->share('Database', function () {
            $config = $this->getContainer()->get('config')['database'];

            $pdo = new ExtendedPdo(
                "mysql:host={$config['host']};port={$config['port']};dbname={$config['schema']}",
                $config['user'],
                $config['password']
            );

            return $pdo;
        });

        $this->getContainer()->share('Database\Data', function () {
            $config = $this->getContainer()->get('config')['database_data'];

            $pdo = new ExtendedPdo(
                "mysql:host={$config['host']};port={$config['port']};dbname={$config['schema']}",
                $config['user'],
                $config['password']
            );

            return $pdo;
        });

        $this->getContainer()->share('Database\Archive', function () {
            $config = $this->getContainer()->get('config')['database_archive'];

            $pdo = new ExtendedPdo(
                "mysql:host={$config['host']};port={$config['port']};dbname={$config['schema']}",
                $config['user'],
                $config['password']
            );

            return $pdo;
        });

        $this->getContainer()->add('Aura\SqlQuery\QueryFactory', function () {
            return new QueryFactory('mysql');
        });
    }
}
