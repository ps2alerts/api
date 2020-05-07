<?php

$container = new League\Container\Container;

$container->delegate(
    new League\Container\ReflectionContainer
);

// Service Providers
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\ConfigServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\DatabaseServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\FractalServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\HttpClientServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\HttpMessageServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\LogServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\RedisServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\TemplateServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\UuidServiceProvider');
$container->addServiceProvider('Ps2alerts\Api\ServiceProvider\UtilityServiceProvider');

// Inflectors
$container->inflector('Ps2alerts\Api\Contract\ConfigAwareInterface')
    ->invokeMethod('setConfig', ['config']);
$container->inflector('Ps2alerts\Api\Contract\DatabaseAwareInterface')
    ->invokeMethod('setDatabaseDriver', ['Database'])
    ->invokeMethod('setDatabaseDataDriver', ['Database\Data'])
    ->invokeMethod('setDatabaseArchiveDriver', ['Database\Archive']);
$container->inflector('Ps2alerts\Api\Contract\FractalAwareInterface')
    ->invokeMethod('setFractalManager', ['League\Fractal\Manager']);
$container->inflector('Ps2alerts\Api\Contract\LogAwareInterface')
    ->invokeMethod('setLogDriver', ['Monolog\Logger']);
$container->inflector('Ps2alerts\Api\Contract\HttpClientAwareInterface')
    ->invokeMethod('setHttpClientDriver', ['GuzzleHttp\Client']);
$container->inflector('Ps2alerts\Api\Contract\HttpMessageAwareInterface')
    ->invokeMethods([
        'setResponse' => ['Zend\Diactoros\Response'],
        'setRequest' => ['Zend\Diactoros\ServerRequest']
    ]);
$container->inflector('Ps2alerts\Api\Contract\TemplateAwareInterface')
    ->invokeMethod('setTemplateDriver', ['Twig_Environment']);
$container->inflector('Ps2alerts\Api\Contract\RedisAwareInterface')
    ->invokeMethod('setRedisDriver', ['redis']);
$container->inflector('Ps2alerts\Api\Contract\UtilityAwareInterface')
    ->invokeMethod('setDateValidationUtility', ['DateValidationUtility'])
    ->invokeMethod('setFractalUtility', ['FractalUtility'])
    ->invokeMethod('setRedisUtility', ['RedisUtility']);
$container->inflector('Ps2alerts\Api\Contract\UuidAwareInterface')
    ->invokeMethod('setUuidDriver', ['Ramsey\Uuid\Uuid']);

// Container Inflector
$container->inflector('League\Container\ContainerAwareInterface')
    ->invokeMethod('setContainer', [$container]);

// Processing deps
$container->add('Ps2alerts\Api\Factory\AuraFactory')
    ->withArgument('Aura\SqlQuery\QueryFactory');

$container->add('Ps2alerts\Api\Transformer\DataTransformer')
    ->withArgument('Ps2alerts\Api\Repository\Data\FacilityDataRepository')
    ->withArgument('Ps2alerts\Api\Repository\Data\VehicleDataRepository')
    ->withArgument('Ps2alerts\Api\Repository\Data\WeaponDataRepository')
    ->withArgument('Ps2alerts\Api\Repository\Data\XpDataRepository');

return $container;
