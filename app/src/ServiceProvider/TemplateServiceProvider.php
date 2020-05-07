<?php

namespace Ps2alerts\Api\ServiceProvider;

use League\Container\ServiceProvider\AbstractServiceProvider;
use Twig_Loader_Filesystem;
use Twig_Environment;
use Twig_Extension_Debug;
use Twig_SimpleFilter;
use Cocur\Slugify\Bridge\Twig\SlugifyExtension;
use Cocur\Slugify\Slugify;

class TemplateServiceProvider extends AbstractServiceProvider
{
    /**
     * @var array
     */
    protected $provides = [
        'Twig_Environment'
    ];

    /**
     * Register function required by ServiceProvider contract
     */
    public function register()
    {
        $config = $this->getContainer()->get('config');
        $globals = [
            'base_url'  => $config['base_url'],
            'asset_url' => $config['base_url'] . '/assets',
            'env'       => $config['environment']
        ];

        // Register the singleton with the container
        $this->getContainer()->share('Twig_Environment', function () use ($globals, $config) {
            $loader = new Twig_Loader_Filesystem(__DIR__ . '/../../template');
            $twig   = new Twig_Environment($loader, [
                'cache' => false,
                'debug' => $config['environment'] === 'development' ? true : false
            ]);

            // Add Globals
            foreach ($globals as $key => $val) {
                $twig->addGlobal($key, $val);
            }
            $twig->addExtension(new SlugifyExtension(Slugify::create(null, array('lowercase' => false))));

            return $twig;
        });
    }
}
