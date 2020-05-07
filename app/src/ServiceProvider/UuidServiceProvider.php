<?php

namespace Ps2alerts\Api\ServiceProvider;

use League\Container\ServiceProvider\AbstractServiceProvider;
use Ramsey\Uuid\Uuid;

class UuidServiceProvider extends AbstractServiceProvider
{
    /**
     * @var array
     */
    protected $provides = [
        'Ramsey\Uuid\Uuid',
    ];

    /**
     * {@inheritdoc}
     */
    public function register()
    {
        $this->getContainer()->add('Ramsey\Uuid\Uuid', function() {
            $uuid = Uuid::Uuid4();
            return $uuid;
        });
    }
}
