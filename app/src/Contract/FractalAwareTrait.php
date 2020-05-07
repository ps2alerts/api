<?php

namespace Ps2alerts\Api\Contract;

use League\Fractal\Manager;
use Ps2alerts\Api\Utility\FractalUtility;

trait FractalAwareTrait
{
    /**
     * @var Manager
     */
    protected $fractal;

    /**
     * @var FractalUtility
     */
    protected $fractalUtility;

    /**
     * Sets the Fractal Manager
     *
     * @param Manager $fractal
     */
    public function setFractalManager(Manager $fractal)
    {
        $this->fractal = $fractal;
    }

    /**
     * Gets the Uuid driver
     *
     * @return Manager
     */
    public function getFractalManager()
    {
        return $this->fractal;
    }
}
