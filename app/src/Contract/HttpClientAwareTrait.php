<?php

namespace Ps2alerts\Api\Contract;

use GuzzleHttp\Client;

trait HttpClientAwareTrait
{
    /**
     * @var Client
     */
    protected $httpClient;

    /**
     * Sets the http client
     *
     * @param Client $httpClient
     */
    public function setHttpClientDriver(Client $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    /**
     * Gets the http client
     *
     * @return Client
     */
    public function getHttpClientDriver()
    {
        return $this->httpClient;
    }
}
