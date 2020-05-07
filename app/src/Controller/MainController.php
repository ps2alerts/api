<?php

namespace Ps2alerts\Api\Controller;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Ps2alerts\Api\Contract\TemplateAwareInterface;
use Ps2alerts\Api\Contract\TemplateAwareTrait;

class MainController implements TemplateAwareInterface
{
    use TemplateAwareTrait;

    /**
     * Index
     * @param  ServerRequestInterface $request
     * @param  ResponseInterface      $response
     * @return ResponseInterface
     */
    public function index(ServerRequestInterface $request, ResponseInterface $response)
    {
        $response->getBody()->write(
            $this->getTemplateDriver()->render('landing.html')
        );

        return $response;
    }
}
