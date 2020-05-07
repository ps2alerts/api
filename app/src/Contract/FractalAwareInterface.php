<?php

namespace Ps2alerts\Api\Contract;

use League\Fractal\Manager;

interface FractalAwareInterface
{
    /**
     * Sets the Fractal Manager
     *
     * @param Manager $fractal
     */
    public function setFractalManager(Manager $fractal);

    /**
     * Gets the Fractal Manager
     *
     * @return Manager
     */
    public function getFractalManager();
}
