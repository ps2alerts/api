<?php

namespace Ps2alerts\Api\Utility;

use Ps2alerts\Api\Contract\RedisAwareInterface;
use Ps2alerts\Api\Contract\RedisAwareTrait;

class RedisUtility implements RedisAwareInterface
{
    use RedisAwareTrait;

    protected $flag = 'NOT-USED';
    protected $misses = 0;
    protected $hits =  0;

    /**
     * Sets the Redis Missed Flag
     *
     * @param string $flag
     */
    public function setFlag($flag)
    {
        $this->flag = $flag;
    }

    /**
     * Sets the Redis Missed Flag, which the response class will pull out to send to the headers
     *
     * @return string
     */
    public function getFlag()
    {
        return $this->flag;
    }

    /**
     * Sets the Redis Missed Flag, which the response class will pull out to send to the headers
     *
     * @return int
     */
    public function getMissCount()
    {
        return $this->misses;
    }

    /**
     * Sets the Redis Missed Flag, which the response class will pull out to send to the headers
     *
     * @return int
     */
    public function getHitCount()
    {
        return $this->hits;
    }

    /**
     * Checks redis for a entry and returns it decoded if exists
     *
     * @param string $store Redis store to pull data from
     * @param string $type player|outfit
     * @param string $id   ID of player or outfit
     * @param string $encodeType Flag to change format of data
     *
     * @return string|boolean
     */
    public function checkRedis($store, $type, $id, $encodeType = 'array')
    {
        $redis = $this->getRedisDriver();

        $key = "ps2alerts:{$store}:{$type}:{$id}";

        if ($redis->exists($key)) {
            if ($encodeType === 'object') {
                $data = json_decode($redis->get($key));
            } else if ($encodeType === 'array') {
                $data = json_decode($redis->get($key), true);
            }

            $this->checkFlagScenario('hit');
            $this->hits++;

            return $data;
        }

        $this->checkFlagScenario('miss');
        $this->misses++;

        return false;
    }

    /**
     * Stores the complete information in Redis
     *
     * @param  string  $namespace Split between cache and API
     * @param  string  $type
     * @param  string  $id
     * @param  string  $data
     * @param  integer $time Time in seconds to store data
     *
     * @throws \Exception
     *
     * @return boolean
     */
    public function storeInRedis($namespace, $type, $id, $data, $time = 0)
    {
        $redis = $this->getRedisDriver();
        $key = "ps2alerts:{$namespace}:{$type}:{$id}";

        $data = json_encode($data);

        // Check for errors #BRINGJSONEXCEPTIONS!
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception();
        }

        if (!$time) {
            $time = 3600 * 24; // 1 day
        }

        $this->checkFlagScenario('store');

        return $redis->setEx($key, $time, $data);
    }


    /**
     * Sets the missed flag for Redis based on scenario.
     *
     * @param string $mode
     *
     * @return void
     */
    public function checkFlagScenario(string $mode)
    {
        /*
            If all keys are missing: Miss
            If one key is found: Partial-Hit
            If ALL keys are found: Hit
        */

        if ($this->getFlag() === 'NOT-USED' || $this->getFlag() !== 'MISS - STORED') {
            if ($mode === 'miss') {
                $this->setFlag('MISS');
            }
            if ($mode === 'store') {
                $this->setFlag('MISS - STORED');
            }
            if ($mode === 'hit') {
                $this->setFlag('HIT');
            }
        }

        // If we've had a miss and we've previously marked as a hit, downgrade to Partial Hit.
        if ($mode === 'miss' && $this->getFlag() === 'HIT') {
            $this->setFlag('PARTIAL-HIT');
        }

        // Already set to Miss
    }
}