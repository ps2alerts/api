<?php

namespace Ps2alerts\Api\Contract;

use Twig_Environment as Twig;

interface TemplateAwareInterface
{
    /**
     * Sets the Template driver
     *
     * @param \Twig_Environment $template
     */
    public function setTemplateDriver(Twig $template);

    /**
     * Gets the Template driver
     *
     * @return \Twig_Environment
     */
    public function getTemplateDriver();
}
