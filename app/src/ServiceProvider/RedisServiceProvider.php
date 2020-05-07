<?php

namespace Ps2alerts\Api\ServiceProvider;

use League\Container\ServiceProvider\AbstractServiceProvider;
use Ps2alerts\Api\Contract\ConfigAwareInterface;
use Ps2alerts\Api\Contract\ConfigAwareTrait;
use Predis\Client;
use Ps2alerts\Api\Utility\RedisUtility;

class RedisServiceProvider extends AbstractServiceProvider implements
    ConfigAwareInterface
{
    use ConfigAwareTrait;
    /**
     * @var array
     */
    protected $provides = [
        'redis',
        'RedisUtility'
    ];

    /**
     * {@inheritdoc}
     */
    public function register()
    {
        $this->getContainer()->add('redis', function () {
            $redisConfig = $this->getContainer()->get('config')['redis'];

            $args = [
                'host'     => $redisConfig['host'],
                'port'     => $redisConfig['port'],
                'database' => intval($redisConfig['db']),
                'scheme'   => 'tcp',
            ];

            if (! empty($redisConfig['pass'])) {
                $args['password'] = $redisConfig['pass'];
            }

            $client = new Client($args);

            return $client;
        });

        $this->getContainer()->share('RedisUtility', function() {
            return new RedisUtility();
        });
    }
}
