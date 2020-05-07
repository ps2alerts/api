<?php

namespace Ps2alerts\Api\Contract;

use Ps2alerts\Api\Utility\DateValidationUtility;
use Ps2alerts\Api\Utility\FractalUtility;
use Ps2alerts\Api\Utility\RedisUtility;

interface UtilityAwareInterface
{
    /**
     * Sets the Fractal Utility
     *
     * @param FractalUtility $class
     */
    public function setFractalUtility(FractalUtility $class);

    /**
     * Gets the Fractal Utility
     *
     * @return FractalUtility
     */
    public function getFractalUtility();

    /**
     * Sets the Redis Utility
     *
     * @param RedisUtility $class
     */
    public function setRedisUtility(RedisUtility $class);

    /**
     * Gets the Redis Utility
     *
     * @return RedisUtility
     */
    public function getRedisUtility();

    /**
     * Sets the Redis Utility
     *
     * @param DateValidationUtility $class
     */
    public function setDateValidationUtility(DateValidationUtility $class);

    /**
     * Gets the Redis Utility
     *
     * @return DateValidationUtility
     */
    public function getDateValidationUtility();
}
