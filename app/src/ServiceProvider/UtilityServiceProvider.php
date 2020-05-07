<?php

namespace Ps2alerts\Api\ServiceProvider;

use League\Container\ServiceProvider\AbstractServiceProvider;
use Ps2alerts\Api\Utility\DateValidationUtility;
use Ps2alerts\Api\Utility\FractalUtility;
use Ps2alerts\Api\Utility\RedisUtility;

class UtilityServiceProvider extends AbstractServiceProvider
{
    /**
     * @var array
     */
    protected $provides = [
        'DateValidationUtility',
        'FractalUtility',
        'RedisUtility'
    ];

    /**
     * {@inheritdoc}
     */
    public function register()
    {
        $this->getContainer()->share('DateValidationUtility', function() {
            return new DateValidationUtility();
        });

        $this->getContainer()->share('FractalUtility', function() {
            return new FractalUtility();
        });

        $this->getContainer()->share('RedisUtility', function() {
            return new RedisUtility();
        });
    }
}
