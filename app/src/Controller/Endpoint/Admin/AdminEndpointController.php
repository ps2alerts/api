<?php

namespace Ps2alerts\Api\Controller\Endpoint\Admin;

use Ps2alerts\Api\Controller\Endpoint\AbstractEndpointController;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

class AdminEndpointController extends AbstractEndpointController
{
    /**
     * Construct
     *
    */
    public function __construct()
    {

    }

    public function createAlert(ServerRequestInterface $request, ResponseInterface $response, array $args)
    {
        $world = $request->get('world');
        $zone = $request->get('zone');
        $apikey = $request->get('apikey');
        $user = $request->get('user');

        var_dump($world);
        var_dump($zone);
        var_dump($headers);
    }

    public function errorTest(ServerRequestInterface $request, ResponseInterface $response, array $args)
    {
        throw new \Exception('Test');
        trigger_error('Test');
    }
}
