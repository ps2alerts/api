<?php

namespace Ps2alerts\Api\Contract;

use Twig_Environment as Twig;

trait TemplateAwareTrait
{
    /**
     * @var \Twig_Environment
     */
    protected $twig;

    /**
     * Sets template Driver
     */
    public function setTemplateDriver(Twig $twig)
    {
        $this->twig = $twig;
    }

    /**
     * Gets the template driver
     */
    public function getTemplateDriver()
    {
        return $this->twig;
    }
}
