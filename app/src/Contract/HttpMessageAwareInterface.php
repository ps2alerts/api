<?php

namespace Ps2alerts\Api\Contract;

use Zend\Diactoros\ServerRequest;
use Zend\Diactoros\Response;

interface HttpMessageAwareInterface
{
    /**
     * Sets the http request object
     *
     * @param \Zend\Diactoros\ServerRequestFactory
     */
    public function setRequest(ServerRequest $obj);

    /**
     * Gets the http request object
     *
     * @return \Zend\Diactoros\ServerRequestFactory
     */
    public function getRequest();

    /**
     * Sets the http response object
     *
     * @param \Zend\Diactoros\Response
     */
    public function setResponse(Response $obj);

    /**
     * Gets the http response object
     *
     * @return \Zend\Diactoros\Response
     */
    public function getResponse();
}
