<?php

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

class ApiKeyMiddleware
{
    public function apiMiddleware(ServerRequestInterface $request, ResponseInterface $response, callable $next)
    {
        var_dump('Middleware');
        return $next($request, $response);
    }
}
