<?php

namespace Ps2alerts\Api\Contract;

use Ps2alerts\Api\Utility\DateValidationUtility;
use Ps2alerts\Api\Utility\FractalUtility;
use Ps2alerts\Api\Utility\RedisUtility;

trait UtilityAwareTrait
{
    /**
     * @var FractalUtility
     */
    protected $fractalUtility;

    /**
     * @var RedisUtility
     */
    protected $redisUtility;

    /**
     * @var DateValidationUtility
     */
    protected $dateValidationUtility;

    /**
     * Sets the Fractal Utility
     *
     * @param FractalUtility $class
     */
    public function setFractalUtility(FractalUtility $class)
    {
        $this->fractalUtility = $class;
    }

    /**
     * Gets the Fractal Utility
     *
     * @return FractalUtility
     */
    public function getFractalUtility()
    {
        return $this->fractalUtility;
    }

    /**
     * Sets the Redis Utility
     *
     * @param RedisUtility $class
     */
    public function setRedisUtility(RedisUtility $class)
    {
        $this->redisUtility = $class;
    }

    /**
     * Gets the Redis Utility
     *
     * @return RedisUtility
     */
    public function getRedisUtility()
    {
        return $this->redisUtility;
    }

    /**
     * Sets the Redis Utility
     *
     * @param DateValidationUtility $class
     */
    public function setDateValidationUtility(DateValidationUtility $class)
    {
        $this->dateValidationUtility = $class;
    }

    /**
     * Gets the Redis Utility
     *
     * @return DateValidationUtility
     */
    public function getDateValidationUtility()
    {
        return $this->dateValidationUtility;
    }
}
