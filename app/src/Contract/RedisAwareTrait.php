<?php

namespace Ps2alerts\Api\Contract;

use Predis\Client;

trait RedisAwareTrait
{
    /**
     * @var Client
     */
    protected $redis;

    /**
     * Sets the Redis driver
     *
     * @param Client $redis
     */
    public function setRedisDriver(Client $redis)
    {
        $this->redis = $redis;
    }

    /**
     * Gets the Redis driver
     *
     * @return \Predis\Client
     */
    public function getRedisDriver()
    {
        return $this->redis;
    }
}
