<?php

namespace Ps2alerts\Api\Contract;

use Monolog\Logger;

trait LogAwareTrait
{
    /**
     * @var \Monolog\Logger
     */
    protected $logger;

    /**
     * Sets the Log driver
     *
     * @param \Monolog\Logger $logger
     */
    public function setLogDriver(Logger $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Gets the Log driver
     *
     * @return \Monolog\Logger
     */
    public function getLogDriver()
    {
        return $this->logger;
    }
}
